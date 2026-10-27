import Foundation

struct Receipt: Identifiable, Hashable {
    var id = UUID()
    var storeName: String
    var date: Date
    var lineItems: [ReceiptLineItem]

    var total: Double { lineItems.reduce(0) { $0 + $1.price } }
}

/// Parsed receipt row; user edits these before adding to the pantry.
struct ReceiptLineItem: Identifiable, Hashable {
    var id = UUID()
    var name: String
    var category: FoodCategory
    var quantity: Double
    var unit: String
    var price: Double
    var expiresOn: Date
    var isIncluded = true
}
