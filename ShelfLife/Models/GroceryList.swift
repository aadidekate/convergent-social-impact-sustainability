import Foundation

struct GroceryList: Identifiable, Hashable {
    var id = UUID()
    var name: String
    var items: [GroceryItem]
}

struct GroceryItem: Identifiable, Hashable {
    var id = UUID()
    var name: String
    var category: FoodCategory
    var quantity: Double
    var unit: String
    var isChecked = false
}
