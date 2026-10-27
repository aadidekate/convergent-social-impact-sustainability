import SwiftUI

@main
struct ShelfLifeApp: App {
    private let services = Services.mock
    @State private var pantry: PantryStore
    @State private var recipes: RecipeStore
    @State private var grocery: GroceryStore
    @State private var circles: CircleStore

    init() {
        let services = Services.mock
        _pantry = State(initialValue: PantryStore(items: MockData.pantryItems, services: services))
        _recipes = State(initialValue: RecipeStore(saved: Array(MockData.recipes.prefix(2)), services: services))
        _grocery = State(initialValue: GroceryStore(lists: MockData.groceryLists, services: services))
        _circles = State(initialValue: CircleStore(services: services))
    }

    var body: some Scene {
        WindowGroup {
            RootTabView()
                .environment(pantry)
                .environment(recipes)
                .environment(grocery)
                .environment(circles)
                .environment(\.services, services)
                .task {
                    await services.notifications.requestAuthorization()
                    pantry.rescheduleNotifications()
                    await circles.load()
                }
        }
    }
}
