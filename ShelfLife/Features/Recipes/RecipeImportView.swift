import SwiftUI

struct RecipeImportView: View {
    @Environment(RecipeStore.self) private var recipes
    @Environment(\.dismiss) private var dismiss
    @State private var urlText = ""
    @State private var isImporting = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Recipe link") {
                    TextField("https://", text: $urlText)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                }

                Section {
                    Button {
                        Task { await importRecipe() }
                    } label: {
                        if isImporting {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                        } else {
                            Text("Import")
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .disabled(parsedURL == nil || isImporting)
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundStyle(Theme.Colors.expired)
                    }
                }

                Section {
                    // TODO(backend): recipe import is a placeholder until server-side parsing exists.
                    BackendPlaceholderBanner("Recipe import returns a placeholder recipe")
                }
            }
            .navigationTitle("Import Recipe")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private var parsedURL: URL? {
        URL(string: urlText.trimmingCharacters(in: .whitespacesAndNewlines))
    }

    private func importRecipe() async {
        guard let parsedURL else { return }
        isImporting = true
        errorMessage = nil
        defer { isImporting = false }
        do {
            _ = try await recipes.importRecipe(from: parsedURL)
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

#Preview {
    RecipeImportView()
        .environment(RecipeStore(saved: [], services: .mock))
}
