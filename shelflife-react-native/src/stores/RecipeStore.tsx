import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { PantryItem, Recipe } from '../types/models';
import { requireContext, useServices } from './ServicesContext';

interface RecipeStore {
  saved: Recipe[];
  suggestions: Recipe[];
  isLoadingSuggestions: boolean;
  refreshSuggestions(pantry: PantryItem[]): Promise<void>;
  isSaved(recipe: Recipe): boolean;
  toggleSaved(recipe: Recipe): void;
  importRecipe(url: string): Promise<Recipe>;
  /** Looks up a recipe in saved or suggested lists. */
  find(id: string): Recipe | undefined;
}

const RecipeContext = createContext<RecipeStore | null>(null);

export function RecipeProvider({ initialSaved, children }: { initialSaved: Recipe[]; children: ReactNode }) {
  const services = useServices();
  const [saved, setSaved] = useState(initialSaved);
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [isLoadingSuggestions, setLoading] = useState(false);

  const refreshSuggestions = useCallback(
    async (pantry: PantryItem[]) => {
      setLoading(true);
      try {
        setSuggestions(await services.recipes.suggestions(pantry));
      } finally {
        setLoading(false);
      }
    },
    [services],
  );

  const toggleSaved = useCallback(
    (recipe: Recipe) =>
      setSaved((prev) => (prev.some((r) => r.id === recipe.id) ? prev.filter((r) => r.id !== recipe.id) : [...prev, recipe])),
    [],
  );

  const importRecipe = useCallback(
    async (url: string) => {
      const recipe = await services.recipes.importRecipe(url);
      setSaved((prev) => [...prev, recipe]);
      return recipe;
    },
    [services],
  );

  const value = useMemo<RecipeStore>(
    () => ({
      saved,
      suggestions,
      isLoadingSuggestions,
      refreshSuggestions,
      isSaved: (recipe) => saved.some((r) => r.id === recipe.id),
      toggleSaved,
      importRecipe,
      find: (id) => saved.find((r) => r.id === id) ?? suggestions.find((r) => r.id === id),
    }),
    [saved, suggestions, isLoadingSuggestions, refreshSuggestions, toggleSaved, importRecipe],
  );

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export const useRecipes = () => requireContext(useContext(RecipeContext), 'useRecipes');
