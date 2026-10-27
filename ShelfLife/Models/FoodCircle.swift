import Foundation

struct FoodCircle: Identifiable, Hashable {
    var id = UUID()
    var name: String
    var members: [CircleMember]
    var sharedItems: [PantryItem]
}

struct CircleMember: Identifiable, Hashable {
    var id = UUID()
    var name: String

    var initials: String {
        name.split(separator: " ").prefix(2).compactMap(\.first).map(String.init).joined()
    }
}
