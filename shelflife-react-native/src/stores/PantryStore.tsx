import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Ingredient, PantryItem, Recipe, RemovalReason } from '../types/models';
import { expiryStatus, sameName } from '../utils/format';
import { requireContext, useServices } from './ServicesContext';

interface PantryStore {
  items: PantryItem[];
  sortedByExpiry: PantryItem[];
  expiringSoon: PantryItem[];
  leadDays: number;
  setLeadDays(days: number): void;
  add(items: PantryItem[]): void;
  update(item: PantryItem): void;
  remove(item: PantryItem, reason: RemovalReason): void;
  /** Deducts a cooked recipe's ingredients, earliest-expiring stock first.
   *  Matching units are decremented; mismatched units count as fully used. */
  consume(ingredients: Ingredient[]): void;
  missingIngredients(recipe: Recipe): Ingredient[];
}

const PantryContext = createContext<PantryStore | null>(null);

function indexOfEarliest(items: PantryItem[], name: string): number {
  let best = -1;
  items.forEach((item, index) => {
    if (sameName(item.name, name) && (best === -1 || item.expiresOn < items[best].expiresOn)) best = index;
  });
  return best;
}

export function PantryProvider({ initialItems, children }: { initialItems: PantryItem[]; children: ReactNode }) {
  const services = useServices();
  const [items, setItems] = useState(initialItems);
  // TODO(backend): persist per-user settings.
  const [leadDays, setLeadDays] = useState(1);

  useEffect(() => {
    services.notifications.reschedule(items, leadDays).catch(() => {});
  }, [items, leadDays, services]);

  const add = useCallback((newItems: PantryItem[]) => setItems((prev) => [...prev, ...newItems]), []);

  const update = useCallback(
    (item: PantryItem) => setItems((prev) => prev.map((existing) => (existing.id === item.id ? item : existing))),
    [],
  );

  const remove = useCallback(
    (item: PantryItem, reason: RemovalReason) => {
      setItems((prev) => prev.filter((existing) => existing.id !== item.id));
      services.analytics.recordRemoval(item, reason);
    },
    [services],
  );

  const consume = useCallback(
    (ingredients: Ingredient[]) => {
      setItems((prev) => {
        const next = [...prev];
        for (const ingredient of ingredients) {
          const index = indexOfEarliest(next, ingredient.name);
          if (index === -1) continue;
          const item = next[index];
          if (item.unit === ingredient.unit && item.quantity > ingredient.quantity) {
            next[index] = { ...item, quantity: item.quantity - ingredient.quantity };
          } else {
            next.splice(index, 1);
            services.analytics.recordRemoval(item, 'used');
          }
        }
        return next;
      });
    },
    [services],
  );

  const value = useMemo<PantryStore>(() => {
    const sortedByExpiry = [...items].sort((a, b) => a.expiresOn.localeCompare(b.expiresOn));
    return {
      items,
      sortedByExpiry,
      expiringSoon: sortedByExpiry.filter((item) => expiryStatus(item) !== 'fresh'),
      leadDays,
      setLeadDays,
      add,
      update,
      remove,
      consume,
      missingIngredients: (recipe) => recipe.ingredients.filter((ing) => indexOfEarliest(items, ing.name) === -1),
    };
  }, [items, leadDays, add, update, remove, consume]);

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}

export const usePantry = () => requireContext(useContext(PantryContext), 'usePantry');
