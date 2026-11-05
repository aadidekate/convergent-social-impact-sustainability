import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { GroceryItem, GroceryList, Ingredient, PantryItem } from '../types/models';
import { createId, today } from '../utils/format';
import { requireContext, useServices } from './ServicesContext';

interface GroceryStore {
  lists: GroceryList[];
  /** Returns the new list's id. */
  createList(name: string): string;
  deleteList(listId: string): void;
  add(item: Omit<GroceryItem, 'id'>, listId: string): void;
  addMissing(ingredients: Ingredient[], listId: string): void;
  toggle(itemId: string, listId: string): void;
  remove(itemId: string, listId: string): void;
  /** Removes checked items from the list and returns them as pantry items with estimated expiry. */
  takeChecked(listId: string): PantryItem[];
}

const GroceryContext = createContext<GroceryStore | null>(null);

export function GroceryProvider({ initialLists, children }: { initialLists: GroceryList[]; children: ReactNode }) {
  const services = useServices();
  const [lists, setLists] = useState(initialLists);

  const updateList = useCallback(
    (listId: string, change: (list: GroceryList) => GroceryList) =>
      setLists((prev) => prev.map((list) => (list.id === listId ? change(list) : list))),
    [],
  );

  const createList = useCallback((name: string) => {
    const id = createId();
    setLists((prev) => [...prev, { id, name, items: [] }]);
    return id;
  }, []);

  const deleteList = useCallback((listId: string) => setLists((prev) => prev.filter((l) => l.id !== listId)), []);

  const add = useCallback(
    (item: Omit<GroceryItem, 'id'>, listId: string) =>
      updateList(listId, (list) => ({ ...list, items: [...list.items, { ...item, id: createId() }] })),
    [updateList],
  );

  const addMissing = useCallback(
    (ingredients: Ingredient[], listId: string) =>
      updateList(listId, (list) => ({
        ...list,
        items: [
          ...list.items,
          ...ingredients.map((ing) => ({
            id: createId(),
            name: ing.name,
            category: 'other' as const,
            quantity: ing.quantity,
            unit: ing.unit,
            isChecked: false,
          })),
        ],
      })),
    [updateList],
  );

  const toggle = useCallback(
    (itemId: string, listId: string) =>
      updateList(listId, (list) => ({
        ...list,
        items: list.items.map((item) => (item.id === itemId ? { ...item, isChecked: !item.isChecked } : item)),
      })),
    [updateList],
  );

  const remove = useCallback(
    (itemId: string, listId: string) =>
      updateList(listId, (list) => ({ ...list, items: list.items.filter((item) => item.id !== itemId) })),
    [updateList],
  );

  const takeChecked = useCallback(
    (listId: string) => {
      const list = lists.find((l) => l.id === listId);
      if (!list) return [];
      const now = today();
      const checked = list.items.filter((item) => item.isChecked);
      updateList(listId, (l) => ({ ...l, items: l.items.filter((item) => !item.isChecked) }));
      return checked.map<PantryItem>((item) => ({
        id: createId(),
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        purchasedOn: now,
        expiresOn: services.expiration.estimatedExpiry(item.category, now),
      }));
    },
    [lists, services, updateList],
  );

  const value = useMemo<GroceryStore>(
    () => ({ lists, createList, deleteList, add, addMissing, toggle, remove, takeChecked }),
    [lists, createList, deleteList, add, addMissing, toggle, remove, takeChecked],
  );

  return <GroceryContext.Provider value={value}>{children}</GroceryContext.Provider>;
}

export const useGrocery = () => requireContext(useContext(GroceryContext), 'useGrocery');
