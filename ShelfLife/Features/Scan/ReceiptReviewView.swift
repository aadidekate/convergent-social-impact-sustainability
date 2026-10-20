import SwiftUI

struct ReceiptReviewView: View {
    @Environment(PantryStore.self) private var pantry
    @Environment(\.dismiss) private var dismiss

    @State private var receipt: Receipt

    init(receipt: Receipt) {
        _receipt = State(initialValue: receipt)
    }

    private var includedCount: Int { receipt.lineItems.filter(\.isIncluded).count }

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                    Text(receipt.storeName)
                        .font(Theme.Fonts.title)
                    HStack {
                        Text(receipt.date.formatted(date: .abbreviated, time: .omitted))
                        Spacer()
                        Text(receipt.total.formatted(.currency(code: "USD")))
                            .font(Theme.Fonts.headline)
                    }
                    .font(Theme.Fonts.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
                }
            }

            Section {
                ForEach($receipt.lineItems) { $item in
                    HStack(alignment: .top, spacing: Theme.Spacing.m) {
                        Toggle("Include", isOn: $item.isIncluded)
                            .labelsHidden()
                        CategoryIcon(category: item.category, size: 28)
                        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                            TextField("Item name", text: $item.name)
                                .font(Theme.Fonts.headline)
                            Text("\(item.quantity.formatted()) \(item.unit) · \(item.price.formatted(.currency(code: "USD")))")
                                .font(Theme.Fonts.caption)
                                .foregroundStyle(Theme.Colors.textSecondary)
                            DatePicker("Expires", selection: $item.expiresOn, displayedComponents: .date)
                                .datePickerStyle(.compact)
                                .font(Theme.Fonts.caption)
                        }
                    }
                    .opacity(item.isIncluded ? 1 : 0.4)
                }
            }
        }
        .navigationTitle("Review")
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            Button("Add \(includedCount) \(includedCount == 1 ? "item" : "items") to pantry", action: addToPantry)
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .disabled(includedCount == 0)
                .frame(maxWidth: .infinity)
                .padding(Theme.Spacing.l)
                .background(.bar)
        }
    }

    private func addToPantry() {
        pantry.add(receipt.lineItems.filter(\.isIncluded).map { line in
            PantryItem(name: line.name, category: line.category, quantity: line.quantity, unit: line.unit,
                       price: line.price, purchasedOn: receipt.date, expiresOn: line.expiresOn)
        })
        dismiss()
    }
}

#Preview {
    let today = Date.now
    NavigationStack {
        ReceiptReviewView(receipt: Receipt(storeName: "H-E-B", date: today, lineItems: [
            ReceiptLineItem(name: "Bananas", category: .produce, quantity: 6, unit: "ct", price: 1.74, expiresOn: today),
            ReceiptLineItem(name: "Whole Milk", category: .dairy, quantity: 1, unit: "gal", price: 3.98, expiresOn: today),
        ]))
    }
    .environment(PantryStore(items: [], services: .mock))
}
