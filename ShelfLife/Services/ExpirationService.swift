import Foundation

protocol ExpirationService {
    func estimatedExpiry(for category: FoodCategory, purchasedOn: Date) -> Date
}

struct MockExpirationService: ExpirationService {
    func estimatedExpiry(for category: FoodCategory, purchasedOn: Date) -> Date {
        // TODO(backend): per-item shelf-life lookup (name + storage) instead of category defaults.
        let days = switch category {
        case .seafood: 2
        case .meat: 3
        case .bakery: 5
        case .produce: 6
        case .dairy: 10
        case .beverages: 30
        case .frozen: 90
        case .pantry: 180
        case .other: 14
        }
        return Calendar.current.date(byAdding: .day, value: days, to: purchasedOn) ?? purchasedOn
    }
}
