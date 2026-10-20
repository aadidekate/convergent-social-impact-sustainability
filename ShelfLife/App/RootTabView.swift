import SwiftUI

struct RootTabView: View {
    var body: some View {
        TabView {
            PantryView()
                .tabItem { Label("Pantry", systemImage: "refrigerator") }

            RecipesView()
                .tabItem { Label("Recipes", systemImage: "book") }

            ScanView()
                .tabItem { Label("Scan", systemImage: "doc.viewfinder") }

            GroceryView()
                .tabItem { Label("Grocery", systemImage: "checklist") }

            InsightsView()
                .tabItem { Label("Insights", systemImage: "chart.bar") }
        }
        .tint(Theme.Colors.accent)
    }
}

#Preview {
    RootTabView()
        .environment(PantryStore(items: MockData.pantryItems, services: .mock))
        .environment(RecipeStore(saved: MockData.recipes, services: .mock))
        .environment(GroceryStore(lists: MockData.groceryLists, services: .mock))
        .environment(CircleStore(services: .mock))
}
