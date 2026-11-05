// Shapes mirror future Supabase rows: string ids, ISO dates (YYYY-MM-DD).

export const FOOD_CATEGORIES = [
  'produce',
  'dairy',
  'meat',
  'seafood',
  'bakery',
  'pantry',
  'frozen',
  'beverages',
  'other',
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export type ISODate = string;

export interface PantryItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  price?: number;
  purchasedOn: ISODate;
  expiresOn: ISODate;
  /** Circle this item is shared with, if any. */
  sharedCircleId?: string;
}

export type ExpiryStatus = 'expired' | 'soon' | 'fresh';

/** Why an item left the pantry; drives waste analytics. */
export type RemovalReason = 'used' | 'wasted';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  sourceUrl?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  isChecked: boolean;
}

export interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
}

export interface CircleMember {
  id: string;
  name: string;
}

export interface FoodCircle {
  id: string;
  name: string;
  members: CircleMember[];
  sharedItems: PantryItem[];
}

export interface MonthlyReport {
  /** First day of the month. */
  month: ISODate;
  spent: number;
  wastedValue: number;
  wastedItemCount: number;
  wasteByCategory: Partial<Record<FoodCategory, number>>;
}

/** Parsed receipt row; user edits these before adding to the pantry. */
export interface ReceiptLineItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  price: number;
  expiresOn: ISODate;
  isIncluded: boolean;
}

export interface Receipt {
  id: string;
  storeName: string;
  date: ISODate;
  lineItems: ReceiptLineItem[];
}
