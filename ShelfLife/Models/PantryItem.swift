import Foundation

struct PantryItem: Identifiable, Hashable, Codable {
    var id = UUID()
    var name: String
    var category: FoodCategory
    var quantity: Double
    var unit: String
    var price: Double?
    var purchasedOn: Date
    var expiresOn: Date
    /// Circle this item is shared with, if any.
    var sharedCircleID: UUID?

    func daysUntilExpiry(from now: Date = .now) -> Int {
        let calendar = Calendar.current
        return calendar.dateComponents([.day], from: calendar.startOfDay(for: now), to: calendar.startOfDay(for: expiresOn)).day ?? 0
    }

    func status(soonThresholdDays: Int = 3, now: Date = .now) -> ExpiryStatus {
        let days = daysUntilExpiry(from: now)
        if days < 0 { return .expired }
        return days <= soonThresholdDays ? .soon : .fresh
    }
}

enum ExpiryStatus {
    case expired, soon, fresh
}

/// Why an item left the pantry; drives waste analytics.
enum RemovalReason {
    case used, wasted
}
