// Backend seams. Swap mocks for Supabase-backed implementations here.
import { mockCircles, mockMonthlyReports, mockRecipes } from '../data/mockData';
import type {
  FoodCategory,
  FoodCircle,
  ISODate,
  MonthlyReport,
  PantryItem,
  Receipt,
  ReceiptLineItem,
  Recipe,
  RemovalReason,
} from '../types/models';
import { addDays, createId, daysUntilExpiry, today } from '../utils/format';
import { notificationService, type NotificationService } from './notifications';

export interface ExpirationService {
  estimatedExpiry(category: FoodCategory, purchasedOn: ISODate): ISODate;
}

export interface ReceiptScanService {
  /** `pages` are local image URIs from the camera. */
  parseReceipt(pages: string[]): Promise<Receipt>;
}

export interface RecipeService {
  /** Recipes ranked so those using soon-to-expire items come first. */
  suggestions(pantry: PantryItem[]): Promise<Recipe[]>;
  importRecipe(url: string): Promise<Recipe>;
}

export interface CircleService {
  fetchCircles(): Promise<FoodCircle[]>;
  invite(email: string, circleId: string): Promise<void>;
  share(item: PantryItem, circleId: string): Promise<void>;
}

export interface AnalyticsService {
  /** Most recent month last. */
  monthlyReports(months: number): Promise<MonthlyReport[]>;
  recordRemoval(item: PantryItem, reason: RemovalReason): void;
}

export interface Services {
  receiptScan: ReceiptScanService;
  expiration: ExpirationService;
  recipes: RecipeService;
  circles: CircleService;
  analytics: AnalyticsService;
  notifications: NotificationService;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const SHELF_LIFE_DAYS: Record<FoodCategory, number> = {
  seafood: 2,
  meat: 3,
  bakery: 5,
  produce: 6,
  dairy: 10,
  beverages: 30,
  frozen: 90,
  pantry: 180,
  other: 14,
};

const mockExpiration: ExpirationService = {
  // TODO(backend): per-item shelf-life lookup (name + storage) instead of category defaults.
  estimatedExpiry: (category, purchasedOn) => addDays(purchasedOn, SHELF_LIFE_DAYS[category]),
};

const mockReceiptScan: ReceiptScanService = {
  async parseReceipt() {
    // TODO(backend): upload pages to OCR/receipt-parsing API, map response to Receipt.
    await sleep(1000);
    const date = today();
    const line = (name: string, category: FoodCategory, quantity: number, unit: string, price: number): ReceiptLineItem => ({
      id: createId(),
      name,
      category,
      quantity,
      unit,
      price,
      expiresOn: mockExpiration.estimatedExpiry(category, date),
      isIncluded: true,
    });
    return {
      id: createId(),
      storeName: 'H-E-B',
      date,
      lineItems: [
        line('Bananas', 'produce', 6, 'ct', 1.74),
        line('Baby Spinach', 'produce', 1, 'bag', 3.49),
        line('Whole Milk', 'dairy', 1, 'gal', 3.98),
        line('Greek Yogurt', 'dairy', 4, 'cups', 4.5),
        line('Chicken Thighs', 'meat', 2, 'lb', 6.82),
        line('Sourdough Loaf', 'bakery', 1, 'loaf', 4.25),
      ],
    };
  },
};

const mockRecipeService: RecipeService = {
  async suggestions(pantry) {
    // TODO(backend): recipe search API keyed on pantry contents.
    const urgency = new Map<string, number>();
    for (const item of pantry) {
      const key = item.name.toLowerCase();
      urgency.set(key, Math.min(urgency.get(key) ?? Infinity, daysUntilExpiry(item)));
    }
    const score = (recipe: Recipe) =>
      recipe.ingredients.reduce((sum, ing) => {
        const days = urgency.get(ing.name.toLowerCase());
        return days === undefined ? sum : sum + Math.max(0, 7 - days);
      }, 0);
    return [...mockRecipes].sort((a, b) => score(b) - score(a));
  },
  async importRecipe(url) {
    // TODO(backend): fetch and parse recipe page (schema.org/Recipe) server-side.
    await sleep(1000);
    const host = url.match(/^https?:\/\/([^/]+)/i)?.[1] ?? 'link';
    return {
      id: createId(),
      title: 'Imported Recipe',
      summary: `Placeholder parsed from ${host}.`,
      minutes: 30,
      servings: 2,
      ingredients: [{ id: createId(), name: 'Baby Spinach', quantity: 1, unit: 'bag' }],
      steps: ['Backend recipe parsing not connected yet.'],
      sourceUrl: url,
    };
  },
};

const mockCircleService: CircleService = {
  // TODO(backend): load circles + membership for signed-in user.
  fetchCircles: async () => mockCircles(),
  // TODO(backend): send circle invite.
  invite: () => sleep(500),
  // TODO(backend): publish shared item to circle members.
  share: () => sleep(300),
};

const mockAnalytics: AnalyticsService = {
  // TODO(backend): aggregate receipts + removal events per month.
  monthlyReports: async (months) => mockMonthlyReports().slice(-months),
  recordRemoval: () => {
    // TODO(backend): log used/wasted event for analytics.
  },
};

export const mockServices: Services = {
  receiptScan: mockReceiptScan,
  expiration: mockExpiration,
  recipes: mockRecipeService,
  circles: mockCircleService,
  analytics: mockAnalytics,
  notifications: notificationService,
};
