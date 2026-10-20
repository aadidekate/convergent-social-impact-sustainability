import Foundation
import Observation

@MainActor @Observable
final class GroceryStore {
    private(set) var lists: [GroceryList]
    private let services: Services

    init(lists: [GroceryList], services: Services) {
        self.lists = lists
        self.services = services
    }

    func createList(named name: String) {
        lists.append(GroceryList(name: name, items: []))
    }

    func deleteList(_ listID: UUID) {
        lists.removeAll { $0.id == listID }
    }

    func add(_ item: GroceryItem, to listID: UUID) {
        guard let index = index(of: listID) else { return }
        lists[index].items.append(item)
    }

    func addMissing(_ ingredients: [Ingredient], to listID: UUID) {
        for ingredient in ingredients {
            add(GroceryItem(name: ingredient.name, category: .other, quantity: ingredient.quantity, unit: ingredient.unit),
                to: listID)
        }
    }

    func toggle(_ itemID: UUID, in listID: UUID) {
        guard let l = index(of: listID), let i = lists[l].items.firstIndex(where: { $0.id == itemID }) else { return }
        lists[l].items[i].isChecked.toggle()
    }

    func remove(_ itemID: UUID, from listID: UUID) {
        guard let index = index(of: listID) else { return }
        lists[index].items.removeAll { $0.id == itemID }
    }

    /// Removes checked items from the list and returns them as pantry items with estimated expiry.
    func takeChecked(from listID: UUID) -> [PantryItem] {
        guard let index = index(of: listID) else { return [] }
        let now = Date.now
        let checked = lists[index].items.filter(\.isChecked)
        lists[index].items.removeAll(where: \.isChecked)
        return checked.map {
            PantryItem(name: $0.name, category: $0.category, quantity: $0.quantity, unit: $0.unit, purchasedOn: now,
                       expiresOn: services.expiration.estimatedExpiry(for: $0.category, purchasedOn: now))
        }
    }

    private func index(of listID: UUID) -> Int? { lists.firstIndex { $0.id == listID } }
}
