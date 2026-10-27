import SwiftUI

struct RecipeDetailView: View {
    let recipe: Recipe
    @Environment(RecipeStore.self) private var recipes
    @Environment(PantryStore.self) private var pantry
    @Environment(GroceryStore.self) private var grocery
    @State private var isConfirmingCook = false

    var body: some View {
        let missing = pantry.missingIngredients(for: recipe)
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.l) {
                Text(recipe.title)
                    .font(Theme.Fonts.largeTitle)
                    .foregroundStyle(Theme.Colors.textPrimary)
                Text(recipe.summary)
                    .font(Theme.Fonts.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                HStack {
                    Pill("\(recipe.minutes) min", systemImage: "clock")
                    Pill("\(recipe.servings) servings", systemImage: "person.2")
                }

                VStack(alignment: .leading, spacing: Theme.Spacing.s) {
                    Text("Ingredients")
                        .font(Theme.Fonts.headline)
                    ForEach(recipe.ingredients) { ingredient in
                        HStack {
                            Text("\(ingredient.quantity.formatted()) \(ingredient.unit) \(ingredient.name)")
                            Spacer()
                            if missing.contains(where: { $0.id == ingredient.id }) {
                                Text("missing")
                                    .font(Theme.Fonts.caption)
                                    .foregroundStyle(Theme.Colors.soon)
                            } else {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(Theme.Colors.fresh)
                            }
                        }
                    }
                }

                VStack(alignment: .leading, spacing: Theme.Spacing.s) {
                    Text("Steps")
                        .font(Theme.Fonts.headline)
                    ForEach(Array(recipe.steps.enumerated()), id: \.offset) { index, step in
                        HStack(alignment: .top, spacing: Theme.Spacing.s) {
                            Text("\(index + 1).")
                                .font(Theme.Fonts.headline)
                            Text(step)
                        }
                    }
                }

                Button {
                    isConfirmingCook = true
                } label: {
                    Label("Cooked it", systemImage: "fork.knife")
                }
                .buttonStyle(.borderedProminent)
                .confirmationDialog("Remove used ingredients from pantry?", isPresented: $isConfirmingCook,
                                    titleVisibility: .visible) {
                    Button("Remove", role: .destructive) {
                        pantry.consume(recipe.ingredients)
                    }
                    Button("Cancel", role: .cancel) {}
                }

                if !missing.isEmpty {
                    if grocery.lists.isEmpty {
                        Button {
                            grocery.createList(named: "Groceries")
                            if let list = grocery.lists.last {
                                grocery.addMissing(missing, to: list.id)
                            }
                        } label: {
                            Label("Add missing to grocery list", systemImage: "cart.badge.plus")
                        }
                        .buttonStyle(.bordered)
                    } else {
                        Menu {
                            ForEach(grocery.lists) { list in
                                Button(list.name) {
                                    grocery.addMissing(missing, to: list.id)
                                }
                            }
                        } label: {
                            Label("Add missing to grocery list", systemImage: "cart.badge.plus")
                        }
                        .buttonStyle(.bordered)
                    }
                }

                if let sourceURL = recipe.sourceURL {
                    Link("View original recipe", destination: sourceURL)
                }
            }
            .padding()
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    recipes.toggleSaved(recipe)
                } label: {
                    Image(systemName: recipes.isSaved(recipe) ? "bookmark.fill" : "bookmark")
                }
                .accessibilityLabel(recipes.isSaved(recipe) ? "Unsave recipe" : "Save recipe")
            }
        }
    }
}

#Preview {
    NavigationStack {
        RecipeDetailView(recipe: MockData.recipes[0])
    }
    .environment(RecipeStore(saved: [], services: .mock))
    .environment(PantryStore(items: MockData.pantryItems, services: .mock))
    .environment(GroceryStore(lists: [], services: .mock))
}
