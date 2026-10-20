import SwiftUI

struct ExpiryBadge: View {
    private let item: PantryItem

    init(item: PantryItem) {
        self.item = item
    }

    var body: some View {
        Text(label)
            .font(Theme.Fonts.caption)
            .foregroundStyle(item.status().color)
            .padding(.horizontal, Theme.Spacing.s)
            .padding(.vertical, Theme.Spacing.xs)
            .background(item.status().color.opacity(0.15), in: Capsule())
    }

    private var label: String {
        switch item.daysUntilExpiry() {
        case ..<0: "Expired"
        case 0: "Today"
        case 1: "Tomorrow"
        case let days: "\(days)d"
        }
    }
}

#Preview {
    let now = Date.now
    let items = [
        PantryItem(name: "Milk", category: .dairy, quantity: 1, unit: "gal",
                   purchasedOn: now, expiresOn: now.addingTimeInterval(-86_400)),
        PantryItem(name: "Spinach", category: .produce, quantity: 1, unit: "bag",
                   purchasedOn: now, expiresOn: now),
        PantryItem(name: "Eggs", category: .dairy, quantity: 12, unit: "pcs",
                   purchasedOn: now, expiresOn: now.addingTimeInterval(86_400)),
        PantryItem(name: "Bread", category: .bakery, quantity: 1, unit: "loaf",
                   purchasedOn: now, expiresOn: now.addingTimeInterval(3 * 86_400)),
        PantryItem(name: "Rice", category: .pantry, quantity: 2, unit: "lb",
                   purchasedOn: now, expiresOn: now.addingTimeInterval(30 * 86_400)),
    ]
    return VStack(alignment: .leading, spacing: Theme.Spacing.s) {
        ForEach(items) { item in
            HStack {
                Text(item.name)
                Spacer()
                ExpiryBadge(item: item)
            }
        }
    }
    .padding()
    .background(Theme.Colors.background)
}
