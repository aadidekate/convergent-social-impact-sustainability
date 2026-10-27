import SwiftUI

struct RecipesView: View {
    @Environment(RecipeStore.self) private var recipes
    @Environment(PantryStore.self) private var pantry
    @State private var listing = Listing.suggested
    @State private var isImporting = false

    private enum Listing: String, CaseIterable, Identifiable {
        case suggested = "Suggested", saved = "Saved"
        var id: String { rawValue }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("Recipes", selection: $listing) {
                    ForEach(Listing.allCases) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)
                .padding([.horizontal, .top])

                switch listing {
                case .suggested: suggestedList
                case .saved: savedList
                }
            }
            .navigationTitle("Recipes")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { isImporting = true } label: {
                        Image(systemName: "square.and.arrow.down")
                    }
                    .accessibilityLabel("Import recipe")
                }
            }
            .sheet(isPresented: $isImporting) {
                RecipeImportView()
            }
            .task { await recipes.refreshSuggestions(for: pantry.items) }
        }
    }

    private var suggestedList: some View {
        List {
            // TODO(backend): suggestions come from MockRecipeService until a recipe search API exists.
            BackendPlaceholderBanner("Suggestions are sample data")
            if recipes.isLoadingSuggestions {
                ProgressView()
                    .frame(maxWidth: .infinity)
            }
            ForEach(recipes.suggestions) { recipe in
                NavigationLink {
                    RecipeDetailView(recipe: recipe)
                } label: {
                    RecipeRow(recipe: recipe, usesExpiring: usesExpiring(recipe))
                }
            }
        }
        .refreshable { await recipes.refreshSuggestions(for: pantry.items) }
    }

    @ViewBuilder
    private var savedList: some View {
        if recipes.saved.isEmpty {
            ContentUnavailableView("No saved recipes", systemImage: "book.closed",
                                   description: Text("Bookmark a recipe to keep it here."))
        } else {
            List {
                ForEach(recipes.saved) { recipe in
                    NavigationLink {
                        RecipeDetailView(recipe: recipe)
                    } label: {
                        RecipeRow(recipe: recipe, usesExpiring: nil)
                    }
                    .swipeActions {
                        Button(role: .destructive) {
                            recipes.toggleSaved(recipe)
                        } label: {
                            Label("Unsave", systemImage: "bookmark.slash")
                        }
                    }
                }
            }
        }
    }

    /// Nil when the recipe uses no expiring items, so the pill is hidden.
    private func usesExpiring(_ recipe: Recipe) -> Int? {
        let expiringNames = Set(pantry.expiringSoon.map { $0.name.lowercased() })
        let count = recipe.ingredients.filter { expiringNames.contains($0.name.lowercased()) }.count
        return count > 0 ? count : nil
    }
}

private struct RecipeRow: View {
    let recipe: Recipe
    let usesExpiring: Int?

    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: Theme.Spacing.s) {
                Text(recipe.title)
                    .font(Theme.Fonts.headline)
                    .foregroundStyle(Theme.Colors.textPrimary)
                Text(recipe.summary)
                    .font(Theme.Fonts.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .lineLimit(2)
                HStack {
                    Pill("\(recipe.minutes) min", systemImage: "clock")
                    Pill("\(recipe.servings) servings", systemImage: "person.2")
                    if let usesExpiring {
                        Pill("Uses \(usesExpiring) expiring", systemImage: "exclamationmark.circle", isSelected: true)
                    }
                }
            }
        }
    }
}

#Preview {
    RecipesView()
        .environment(RecipeStore(saved: MockData.recipes, services: .mock))
        .environment(PantryStore(items: MockData.pantryItems, services: .mock))
}
