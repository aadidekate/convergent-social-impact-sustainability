import Foundation

protocol RecipeService {
    /// Recipes ranked so those using soon-to-expire items come first.
    func suggestions(for pantry: [PantryItem]) async -> [Recipe]
    func importRecipe(from url: URL) async throws -> Recipe
}

struct MockRecipeService: RecipeService {
    func suggestions(for pantry: [PantryItem]) async -> [Recipe] {
        // TODO(backend): recipe search API keyed on pantry contents.
        let urgency = Dictionary(pantry.map { ($0.name.lowercased(), $0.daysUntilExpiry()) },
                                 uniquingKeysWith: min)
        func score(_ recipe: Recipe) -> Int {
            recipe.ingredients.compactMap { urgency[$0.name.lowercased()] }.map { max(0, 7 - $0) }.reduce(0, +)
        }
        return MockData.recipes.sorted { score($0) > score($1) }
    }

    func importRecipe(from url: URL) async throws -> Recipe {
        // TODO(backend): fetch and parse recipe page (schema.org/Recipe) server-side.
        try await Task.sleep(for: .seconds(1))
        return Recipe(title: "Imported Recipe", summary: "Placeholder parsed from \(url.host() ?? "link").",
                      minutes: 30, servings: 2,
                      ingredients: [Ingredient(name: "Baby Spinach", quantity: 1, unit: "bag")],
                      steps: ["Backend recipe parsing not connected yet."], sourceURL: url)
    }
}
