import SwiftUI

struct PantryItemDetailView: View {
    @Environment(PantryStore.self) private var pantry
    @Environment(CircleStore.self) private var circles
    @Environment(\.dismiss) private var dismiss

    private let itemID: UUID
    @State private var showingEditor = false
    @State private var showingShareSheet = false

    init(item: PantryItem) {
        itemID = item.id
    }

    private var item: PantryItem? {
        pantry.items.first { $0.id == itemID }
    }

    var body: some View {
        Group {
            if let item {
                details(for: item)
            } else {
                ContentUnavailableView("Item Removed", systemImage: "trash", description: Text("This item is no longer in your pantry."))
            }
        }
        .navigationTitle(item?.name ?? "")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func details(for item: PantryItem) -> some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.l) {
                CategoryIcon(category: item.category, size: 96)
                Text(item.name)
                    .font(Theme.Fonts.largeTitle)
                    .foregroundStyle(Theme.Colors.textPrimary)
                ExpiryBadge(item: item)

                Card {
                    VStack(alignment: .leading, spacing: Theme.Spacing.m) {
                        detailRow("Quantity", "\(item.quantity.formatted()) \(item.unit)")
                        detailRow("Price", item.price?.formatted(.currency(code: "USD")) ?? "None")
                        detailRow("Purchased", item.purchasedOn.formatted(date: .abbreviated, time: .omitted))
                        detailRow("Expires", item.expiresOn.formatted(date: .abbreviated, time: .omitted))
                        detailRow("Shared with", sharedCircleNames(for: item))
                    }
                }

                VStack(spacing: Theme.Spacing.s) {
                    Button("Edit") {
                        showingEditor = true
                    }
                    .buttonStyle(.bordered)

                    Button("Share with circle") {
                        showingShareSheet = true
                    }
                    .buttonStyle(.bordered)

                    Button("Mark used") {
                        pantry.remove(item, reason: .used)
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.green)

                    Button("Mark wasted") {
                        pantry.remove(item, reason: .wasted)
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.red)
                }
            }
            .padding(Theme.Spacing.l)
        }
        .background(Theme.Colors.background)
        .sheet(isPresented: $showingEditor) {
            PantryItemEditor(item: item)
        }
        .sheet(isPresented: $showingShareSheet) {
            SharePantryItemSheet(item: item)
        }
    }

    private func sharedCircleNames(for item: PantryItem) -> String {
        let names = circles.circles.filter { $0.sharedItems.contains { $0.id == item.id } }.map(\.name)
        return names.isEmpty ? "Not shared" : names.joined(separator: ", ")
    }

    private func detailRow(_ title: String, _ value: String) -> some View {
        HStack {
            Text(title)
                .foregroundStyle(Theme.Colors.textSecondary)
            Spacer()
            Text(value)
                .foregroundStyle(Theme.Colors.textPrimary)
        }
        .font(Theme.Fonts.body)
    }
}

#Preview {
    let items = MockData.pantryItems
    return NavigationStack {
        PantryItemDetailView(item: items[0])
    }
    .environment(PantryStore(items: items, services: .mock))
    .environment(CircleStore(services: .mock))
}
