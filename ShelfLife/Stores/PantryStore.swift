import Foundation
import Observation

@MainActor @Observable
final class PantryStore {
    static let leadDaysKey = "notificationLeadDays"

    private(set) var items: [PantryItem]
    private let services: Services

    init(items: [PantryItem], services: Services) {
        self.items = items
        self.services = services
    }

    var sortedByExpiry: [PantryItem] { items.sorted { $0.expiresOn < $1.expiresOn } }

    var expiringSoon: [PantryItem] { sortedByExpiry.filter { $0.status() != .fresh } }

    func add(_ newItems: [PantryItem]) {
        items.append(contentsOf: newItems)
        rescheduleNotifications()
    }

    func update(_ item: PantryItem) {
        guard let index = items.firstIndex(where: { $0.id == item.id }) else { return }
        items[index] = item
        rescheduleNotifications()
    }

    func remove(_ item: PantryItem, reason: RemovalReason) {
        items.removeAll { $0.id == item.id }
        services.analytics.recordRemoval(of: item, reason: reason)
        rescheduleNotifications()
    }

    /// Deducts a cooked recipe's ingredients, earliest-expiring stock first.
    /// Matching units are decremented; mismatched units count as fully used.
    func consume(_ ingredients: [Ingredient]) {
        for ingredient in ingredients {
            guard let index = indexOfEarliest(named: ingredient.name) else { continue }
            var item = items[index]
            if item.unit == ingredient.unit, item.quantity > ingredient.quantity {
                item.quantity -= ingredient.quantity
                items[index] = item
            } else {
                items.remove(at: index)
                services.analytics.recordRemoval(of: item, reason: .used)
            }
        }
        rescheduleNotifications()
    }

    func missingIngredients(for recipe: Recipe) -> [Ingredient] {
        recipe.ingredients.filter { indexOfEarliest(named: $0.name) == nil }
    }

    func rescheduleNotifications() {
        let leadDays = UserDefaults.standard.object(forKey: Self.leadDaysKey) as? Int ?? 1
        let snapshot = items
        Task { await services.notifications.reschedule(for: snapshot, leadDays: leadDays) }
    }

    private func indexOfEarliest(named name: String) -> Int? {
        items.indices
            .filter { items[$0].name.localizedCaseInsensitiveCompare(name) == .orderedSame }
            .min { items[$0].expiresOn < items[$1].expiresOn }
    }
}
