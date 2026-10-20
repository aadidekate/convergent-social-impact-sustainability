import Foundation
import Observation

@MainActor @Observable
final class RecipeStore {
    private(set) var saved: [Recipe]
    private(set) var suggestions: [Recipe] = []
    private(set) var isLoadingSuggestions = false
    private let services: Services

    init(saved: [Recipe], services: Services) {
        self.saved = saved
        self.services = services
    }

    func refreshSuggestions(for pantry: [PantryItem]) async {
        isLoadingSuggestions = true
        suggestions = await services.recipes.suggestions(for: pantry)
        isLoadingSuggestions = false
    }

    func isSaved(_ recipe: Recipe) -> Bool { saved.contains { $0.id == recipe.id } }

    func toggleSaved(_ recipe: Recipe) {
        if isSaved(recipe) {
            saved.removeAll { $0.id == recipe.id }
        } else {
            saved.append(recipe)
        }
    }

    func importRecipe(from url: URL) async throws -> Recipe {
        let recipe = try await services.recipes.importRecipe(from: url)
        saved.append(recipe)
        return recipe
    }
}
