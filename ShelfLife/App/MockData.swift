import Foundation

enum MockData {
    static var pantryItems: [PantryItem] {
        [
            PantryItem(name: "Baby Spinach", category: .produce, quantity: 1, unit: "bag", price: 3.99, purchasedOn: daysFromNow(-5), expiresOn: daysFromNow(2)),
            PantryItem(name: "Whole Milk", category: .dairy, quantity: 1, unit: "gal", price: 4.29, purchasedOn: daysFromNow(-6), expiresOn: daysFromNow(1)),
            PantryItem(name: "Chicken Thighs", category: .meat, quantity: 1.5, unit: "lb", price: 7.49, purchasedOn: daysFromNow(-3), expiresOn: daysFromNow(0)),
            PantryItem(name: "Eggs", category: .dairy, quantity: 12, unit: "ct", price: 3.79, purchasedOn: daysFromNow(-10), expiresOn: daysFromNow(21)),
            PantryItem(name: "Greek Yogurt", category: .dairy, quantity: 32, unit: "oz", price: 5.49, purchasedOn: daysFromNow(-12), expiresOn: daysFromNow(-2)),
            PantryItem(name: "Tomatoes", category: .produce, quantity: 4, unit: "ct", price: 2.99, purchasedOn: daysFromNow(-4), expiresOn: daysFromNow(3)),
            PantryItem(name: "Sourdough Loaf", category: .bakery, quantity: 1, unit: "loaf", price: 5.25, purchasedOn: daysFromNow(-2), expiresOn: daysFromNow(5)),
            PantryItem(name: "Cheddar Cheese", category: .dairy, quantity: 8, unit: "oz", price: 4.19, purchasedOn: daysFromNow(-20), expiresOn: daysFromNow(30)),
            PantryItem(name: "Rice", category: .pantry, quantity: 5, unit: "lb", price: 6.49, purchasedOn: daysFromNow(-40), expiresOn: daysFromNow(180)),
            PantryItem(name: "Bananas", category: .produce, quantity: 6, unit: "ct", price: 1.49, purchasedOn: daysFromNow(-3), expiresOn: daysFromNow(6)),
            PantryItem(name: "Orange Juice", category: .beverages, quantity: 52, unit: "oz", price: 4.79, purchasedOn: daysFromNow(-7), expiresOn: daysFromNow(10)),
            PantryItem(name: "Frozen Peas", category: .frozen, quantity: 1, unit: "bag", price: 2.49, purchasedOn: daysFromNow(-30), expiresOn: daysFromNow(120)),
        ]
    }

    static let recipes: [Recipe] = [
        Recipe(
            title: "Spinach Omelette",
            summary: "Fluffy eggs folded around wilted spinach and melted cheddar.",
            minutes: 15,
            servings: 1,
            ingredients: [
                Ingredient(name: "Eggs", quantity: 3, unit: "ct"),
                Ingredient(name: "Baby Spinach", quantity: 2, unit: "cups"),
                Ingredient(name: "Cheddar Cheese", quantity: 2, unit: "oz"),
            ],
            steps: [
                "Whisk eggs with a pinch of salt.",
                "Wilt spinach in a buttered pan over medium heat, about 1 minute.",
                "Pour in eggs, let set undisturbed for 1 minute.",
                "Scatter cheese over half, fold, and slide onto a plate.",
            ]
        ),
        Recipe(
            title: "Chicken Fried Rice",
            summary: "Day-old rice fried with chicken, egg, and garlic.",
            minutes: 30,
            servings: 2,
            ingredients: [
                Ingredient(name: "Chicken Thighs", quantity: 1, unit: "lb"),
                Ingredient(name: "Rice", quantity: 3, unit: "cups"),
                Ingredient(name: "Eggs", quantity: 2, unit: "ct"),
                Ingredient(name: "Garlic", quantity: 2, unit: "ct"),
            ],
            steps: [
                "Dice chicken and cook in a hot wok until browned and cooked through.",
                "Push chicken aside, scramble eggs, then combine.",
                "Add cold cooked rice and minced garlic, stir-fry 3 minutes.",
                "Season with soy sauce and sliced scallions before serving.",
            ]
        ),
        Recipe(
            title: "Banana Smoothie",
            summary: "Creamy breakfast smoothie with yogurt and milk.",
            minutes: 5,
            servings: 2,
            ingredients: [
                Ingredient(name: "Bananas", quantity: 2, unit: "ct"),
                Ingredient(name: "Greek Yogurt", quantity: 1, unit: "cups"),
                Ingredient(name: "Whole Milk", quantity: 1, unit: "cups"),
            ],
            steps: [
                "Peel and slice bananas, freeze for 30 minutes if you want it thicker.",
                "Add bananas, yogurt, and milk to a blender.",
                "Blend on high until smooth, about 30 seconds.",
            ]
        ),
        Recipe(
            title: "Tomato Bruschetta",
            summary: "Toasted sourdough topped with fresh tomato and garlic.",
            minutes: 10,
            servings: 4,
            ingredients: [
                Ingredient(name: "Tomatoes", quantity: 3, unit: "ct"),
                Ingredient(name: "Sourdough Loaf", quantity: 1, unit: "loaf"),
                Ingredient(name: "Garlic", quantity: 1, unit: "ct"),
            ],
            steps: [
                "Dice tomatoes and toss with salt and a splash of olive oil.",
                "Slice sourdough and toast until golden on both sides.",
                "Rub each slice with a cut garlic clove.",
                "Spoon tomatoes over the toast and serve right away.",
            ]
        ),
        Recipe(
            title: "Pasta Primavera",
            summary: "Quick pasta tossed with spinach, tomatoes, and cheddar.",
            minutes: 25,
            servings: 3,
            ingredients: [
                Ingredient(name: "Pasta", quantity: 8, unit: "oz"),
                Ingredient(name: "Tomatoes", quantity: 2, unit: "ct"),
                Ingredient(name: "Baby Spinach", quantity: 2, unit: "cups"),
                Ingredient(name: "Cheddar Cheese", quantity: 2, unit: "oz"),
            ],
            steps: [
                "Boil pasta in well-salted water until al dente, then drain.",
                "Halve tomatoes and saute in olive oil for 3 minutes.",
                "Toss in spinach until wilted, then add pasta.",
                "Finish with grated cheddar and black pepper.",
            ]
        ),
        Recipe(
            title: "Garlic Shrimp Toast",
            summary: "Buttery shrimp and garlic piled on crisp sourdough.",
            minutes: 20,
            servings: 2,
            ingredients: [
                Ingredient(name: "Shrimp", quantity: 1, unit: "lb"),
                Ingredient(name: "Garlic", quantity: 3, unit: "ct"),
                Ingredient(name: "Sourdough Loaf", quantity: 0.5, unit: "loaf"),
            ],
            steps: [
                "Toast sourdough slices until crisp.",
                "Saute minced garlic in butter for 30 seconds.",
                "Add shrimp and cook 2 minutes per side until pink.",
                "Spoon shrimp and pan sauce over the toast.",
            ]
        ),
    ]

    static let groceryLists: [GroceryList] = [
        GroceryList(name: "Weekly", items: [
            GroceryItem(name: "Avocados", category: .produce, quantity: 4, unit: "ct"),
            GroceryItem(name: "Paper Towels", category: .other, quantity: 1, unit: "ct", isChecked: true),
            GroceryItem(name: "Salmon Fillet", category: .seafood, quantity: 1, unit: "lb"),
            GroceryItem(name: "Oat Milk", category: .beverages, quantity: 1, unit: "gal", isChecked: true),
            GroceryItem(name: "Brown Rice", category: .pantry, quantity: 2, unit: "lb", isChecked: true),
        ]),
        GroceryList(name: "Party", items: [
            GroceryItem(name: "Tortilla Chips", category: .pantry, quantity: 2, unit: "bag", isChecked: true),
            GroceryItem(name: "Sparkling Water", category: .beverages, quantity: 12, unit: "ct"),
            GroceryItem(name: "Ice Cream", category: .frozen, quantity: 1, unit: "gal"),
        ]),
    ]

    static let circles: [FoodCircle] = [
        FoodCircle(
            name: "Roommates",
            members: [
                CircleMember(name: "Alex Kim"),
                CircleMember(name: "Jordan Lee"),
                CircleMember(name: "Sam Patel"),
            ],
            sharedItems: [
                PantryItem(name: "Butter", category: .dairy, quantity: 1, unit: "lb", price: 3.99, purchasedOn: daysFromNow(-2), expiresOn: daysFromNow(25)),
                PantryItem(name: "Coffee Beans", category: .beverages, quantity: 1, unit: "bag", price: 9.99, purchasedOn: daysFromNow(-8), expiresOn: daysFromNow(90)),
            ]
        ),
        FoodCircle(
            name: "Family",
            members: [
                CircleMember(name: "Maria Lopez"),
                CircleMember(name: "Carlos Lopez"),
                CircleMember(name: "Lily Lopez"),
                CircleMember(name: "Diego Lopez"),
            ],
            sharedItems: [
                PantryItem(name: "Cereal", category: .pantry, quantity: 1, unit: "bag", price: 4.29, purchasedOn: daysFromNow(-6), expiresOn: daysFromNow(90)),
                PantryItem(name: "Orange Juice", category: .beverages, quantity: 1, unit: "gal", price: 4.79, purchasedOn: daysFromNow(-7), expiresOn: daysFromNow(10)),
            ]
        ),
    ]

    static let monthlyReports: [MonthlyReport] = [
        MonthlyReport(month: monthStart(monthsAgo: 5), spent: 282, wastedValue: 55, wastedItemCount: 11, wasteByCategory: [.produce: 22, .dairy: 15, .meat: 12, .bakery: 6]),
        MonthlyReport(month: monthStart(monthsAgo: 4), spent: 341, wastedValue: 48, wastedItemCount: 9, wasteByCategory: [.produce: 19, .dairy: 13, .meat: 10, .bakery: 6]),
        MonthlyReport(month: monthStart(monthsAgo: 3), spent: 309, wastedValue: 41, wastedItemCount: 8, wasteByCategory: [.produce: 17, .dairy: 11, .meat: 8, .other: 5]),
        MonthlyReport(month: monthStart(monthsAgo: 2), spent: 396, wastedValue: 36, wastedItemCount: 6, wasteByCategory: [.produce: 14, .dairy: 10, .bakery: 7, .pantry: 5]),
        MonthlyReport(month: monthStart(monthsAgo: 1), spent: 352, wastedValue: 27, wastedItemCount: 5, wasteByCategory: [.produce: 11, .dairy: 8, .frozen: 5, .other: 3]),
        MonthlyReport(month: monthStart(monthsAgo: 0), spent: 414, wastedValue: 18, wastedItemCount: 3, wasteByCategory: [.produce: 7, .dairy: 5, .bakery: 4, .pantry: 2]),
    ]

    private static func daysFromNow(_ d: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: d, to: .now) ?? .now
    }

    private static func monthStart(monthsAgo: Int) -> Date {
        let calendar = Calendar.current
        let shifted = calendar.date(byAdding: .month, value: -monthsAgo, to: .now) ?? .now
        return calendar.dateInterval(of: .month, for: shifted)?.start ?? shifted
    }
}
