import type {
  FoodCategory,
  FoodCircle,
  GroceryItem,
  GroceryList,
  Ingredient,
  MonthlyReport,
  PantryItem,
  Recipe,
} from '../types/models';
import { createId, daysFromNow, monthStart } from '../utils/format';

function pantryItem(
  name: string,
  category: FoodCategory,
  quantity: number,
  unit: string,
  price: number,
  purchasedDaysAgo: number,
  expiresInDays: number,
): PantryItem {
  return {
    id: createId(),
    name,
    category,
    quantity,
    unit,
    price,
    purchasedOn: daysFromNow(-purchasedDaysAgo),
    expiresOn: daysFromNow(expiresInDays),
  };
}

function ingredient(name: string, quantity: number, unit: string): Ingredient {
  return { id: createId(), name, quantity, unit };
}

function groceryItem(name: string, category: FoodCategory, quantity: number, unit: string, isChecked = false): GroceryItem {
  return { id: createId(), name, category, quantity, unit, isChecked };
}

export function mockPantryItems(): PantryItem[] {
  return [
    pantryItem('Baby Spinach', 'produce', 1, 'bag', 3.99, 5, 2),
    pantryItem('Whole Milk', 'dairy', 1, 'gal', 4.29, 6, 1),
    pantryItem('Chicken Thighs', 'meat', 1.5, 'lb', 7.49, 3, 0),
    pantryItem('Eggs', 'dairy', 12, 'ct', 3.79, 10, 21),
    pantryItem('Greek Yogurt', 'dairy', 32, 'oz', 5.49, 12, -2),
    pantryItem('Tomatoes', 'produce', 4, 'ct', 2.99, 4, 3),
    pantryItem('Sourdough Loaf', 'bakery', 1, 'loaf', 5.25, 2, 5),
    pantryItem('Cheddar Cheese', 'dairy', 8, 'oz', 4.19, 20, 30),
    pantryItem('Rice', 'pantry', 5, 'lb', 6.49, 40, 180),
    pantryItem('Bananas', 'produce', 6, 'ct', 1.49, 3, 6),
    pantryItem('Orange Juice', 'beverages', 52, 'oz', 4.79, 7, 10),
    pantryItem('Frozen Peas', 'frozen', 1, 'bag', 2.49, 30, 120),
  ];
}

export const mockRecipes: Recipe[] = [
  {
    id: createId(),
    title: 'Spinach Omelette',
    summary: 'Fluffy eggs folded around wilted spinach and melted cheddar.',
    minutes: 15,
    servings: 1,
    ingredients: [ingredient('Eggs', 3, 'ct'), ingredient('Baby Spinach', 2, 'cups'), ingredient('Cheddar Cheese', 2, 'oz')],
    steps: [
      'Whisk eggs with a pinch of salt.',
      'Wilt spinach in a buttered pan over medium heat, about 1 minute.',
      'Pour in eggs, let set undisturbed for 1 minute.',
      'Scatter cheese over half, fold, and slide onto a plate.',
    ],
  },
  {
    id: createId(),
    title: 'Chicken Fried Rice',
    summary: 'Day-old rice fried with chicken, egg, and garlic.',
    minutes: 30,
    servings: 2,
    ingredients: [
      ingredient('Chicken Thighs', 1, 'lb'),
      ingredient('Rice', 3, 'cups'),
      ingredient('Eggs', 2, 'ct'),
      ingredient('Garlic', 2, 'ct'),
    ],
    steps: [
      'Dice chicken and cook in a hot wok until browned and cooked through.',
      'Push chicken aside, scramble eggs, then combine.',
      'Add cold cooked rice and minced garlic, stir-fry 3 minutes.',
      'Season with soy sauce and sliced scallions before serving.',
    ],
  },
  {
    id: createId(),
    title: 'Banana Smoothie',
    summary: 'Creamy breakfast smoothie with yogurt and milk.',
    minutes: 5,
    servings: 2,
    ingredients: [ingredient('Bananas', 2, 'ct'), ingredient('Greek Yogurt', 1, 'cups'), ingredient('Whole Milk', 1, 'cups')],
    steps: [
      'Peel and slice bananas, freeze for 30 minutes if you want it thicker.',
      'Add bananas, yogurt, and milk to a blender.',
      'Blend on high until smooth, about 30 seconds.',
    ],
  },
  {
    id: createId(),
    title: 'Tomato Bruschetta',
    summary: 'Toasted sourdough topped with fresh tomato and garlic.',
    minutes: 10,
    servings: 4,
    ingredients: [ingredient('Tomatoes', 3, 'ct'), ingredient('Sourdough Loaf', 1, 'loaf'), ingredient('Garlic', 1, 'ct')],
    steps: [
      'Dice tomatoes and toss with salt and a splash of olive oil.',
      'Slice sourdough and toast until golden on both sides.',
      'Rub each slice with a cut garlic clove.',
      'Spoon tomatoes over the toast and serve right away.',
    ],
  },
  {
    id: createId(),
    title: 'Pasta Primavera',
    summary: 'Quick pasta tossed with spinach, tomatoes, and cheddar.',
    minutes: 25,
    servings: 3,
    ingredients: [
      ingredient('Pasta', 8, 'oz'),
      ingredient('Tomatoes', 2, 'ct'),
      ingredient('Baby Spinach', 2, 'cups'),
      ingredient('Cheddar Cheese', 2, 'oz'),
    ],
    steps: [
      'Boil pasta in well-salted water until al dente, then drain.',
      'Halve tomatoes and saute in olive oil for 3 minutes.',
      'Toss in spinach until wilted, then add pasta.',
      'Finish with grated cheddar and black pepper.',
    ],
  },
  {
    id: createId(),
    title: 'Garlic Shrimp Toast',
    summary: 'Buttery shrimp and garlic piled on crisp sourdough.',
    minutes: 20,
    servings: 2,
    ingredients: [ingredient('Shrimp', 1, 'lb'), ingredient('Garlic', 3, 'ct'), ingredient('Sourdough Loaf', 0.5, 'loaf')],
    steps: [
      'Toast sourdough slices until crisp.',
      'Saute minced garlic in butter for 30 seconds.',
      'Add shrimp and cook 2 minutes per side until pink.',
      'Spoon shrimp and pan sauce over the toast.',
    ],
  },
];

export function mockGroceryLists(): GroceryList[] {
  return [
    {
      id: createId(),
      name: 'Weekly',
      items: [
        groceryItem('Avocados', 'produce', 4, 'ct'),
        groceryItem('Paper Towels', 'other', 1, 'ct', true),
        groceryItem('Salmon Fillet', 'seafood', 1, 'lb'),
        groceryItem('Oat Milk', 'beverages', 1, 'gal', true),
        groceryItem('Brown Rice', 'pantry', 2, 'lb', true),
      ],
    },
    {
      id: createId(),
      name: 'Party',
      items: [
        groceryItem('Tortilla Chips', 'pantry', 2, 'bag', true),
        groceryItem('Sparkling Water', 'beverages', 12, 'ct'),
        groceryItem('Ice Cream', 'frozen', 1, 'gal'),
      ],
    },
  ];
}

export function mockCircles(): FoodCircle[] {
  const member = (name: string) => ({ id: createId(), name });
  return [
    {
      id: createId(),
      name: 'Roommates',
      members: [member('Alex Kim'), member('Jordan Lee'), member('Sam Patel')],
      sharedItems: [
        pantryItem('Butter', 'dairy', 1, 'lb', 3.99, 2, 25),
        pantryItem('Coffee Beans', 'beverages', 1, 'bag', 9.99, 8, 90),
      ],
    },
    {
      id: createId(),
      name: 'Family',
      members: [member('Maria Lopez'), member('Carlos Lopez'), member('Lily Lopez'), member('Diego Lopez')],
      sharedItems: [
        pantryItem('Cereal', 'pantry', 1, 'bag', 4.29, 6, 90),
        pantryItem('Orange Juice', 'beverages', 1, 'gal', 4.79, 7, 10),
      ],
    },
  ];
}

export function mockMonthlyReports(): MonthlyReport[] {
  return [
    { month: monthStart(5), spent: 282, wastedValue: 55, wastedItemCount: 11, wasteByCategory: { produce: 22, dairy: 15, meat: 12, bakery: 6 } },
    { month: monthStart(4), spent: 341, wastedValue: 48, wastedItemCount: 9, wasteByCategory: { produce: 19, dairy: 13, meat: 10, bakery: 6 } },
    { month: monthStart(3), spent: 309, wastedValue: 41, wastedItemCount: 8, wasteByCategory: { produce: 17, dairy: 11, meat: 8, other: 5 } },
    { month: monthStart(2), spent: 396, wastedValue: 36, wastedItemCount: 6, wasteByCategory: { produce: 14, dairy: 10, bakery: 7, pantry: 5 } },
    { month: monthStart(1), spent: 352, wastedValue: 27, wastedItemCount: 5, wasteByCategory: { produce: 11, dairy: 8, frozen: 5, other: 3 } },
    { month: monthStart(0), spent: 414, wastedValue: 18, wastedItemCount: 3, wasteByCategory: { produce: 7, dairy: 5, bakery: 4, pantry: 2 } },
  ];
}
