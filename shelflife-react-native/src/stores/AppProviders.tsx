import type { ReactNode } from 'react';
import { mockGroceryLists, mockPantryItems, mockRecipes } from '../data/mockData';
import { CircleProvider } from './CircleStore';
import { GroceryProvider } from './GroceryStore';
import { PantryProvider } from './PantryStore';
import { RecipeProvider } from './RecipeStore';
import { ScanProvider } from './ScanStore';
import { ServicesProvider } from './ServicesContext';

const initialPantry = mockPantryItems();
const initialLists = mockGroceryLists();
const initialSaved = mockRecipes.slice(0, 2);

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ServicesProvider>
      <PantryProvider initialItems={initialPantry}>
        <RecipeProvider initialSaved={initialSaved}>
          <GroceryProvider initialLists={initialLists}>
            <CircleProvider>
              <ScanProvider>{children}</ScanProvider>
            </CircleProvider>
          </GroceryProvider>
        </RecipeProvider>
      </PantryProvider>
    </ServicesProvider>
  );
}
