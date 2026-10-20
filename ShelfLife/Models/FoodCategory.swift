import Foundation

enum FoodCategory: String, CaseIterable, Codable, Identifiable {
    case produce, dairy, meat, seafood, bakery, pantry, frozen, beverages, other

    var id: String { rawValue }

    var displayName: String { rawValue.capitalized }

    var symbol: String {
        switch self {
        case .produce: "carrot"
        case .dairy: "cup.and.saucer"
        case .meat: "fork.knife"
        case .seafood: "fish"
        case .bakery: "birthday.cake"
        case .pantry: "cabinet"
        case .frozen: "snowflake"
        case .beverages: "waterbottle"
        case .other: "basket"
        }
    }
}
