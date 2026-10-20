import Foundation

struct Ingredient: Identifiable, Hashable, Codable {
    var id = UUID()
    var name: String
    var quantity: Double
    var unit: String
}

struct Recipe: Identifiable, Hashable, Codable {
    var id = UUID()
    var title: String
    var summary: String
    var minutes: Int
    var servings: Int
    var ingredients: [Ingredient]
    var steps: [String]
    var sourceURL: URL?
}
