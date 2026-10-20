import SwiftUI

struct PantryItemEditor: View {
    @Environment(PantryStore.self) private var pantry
    @Environment(\.services) private var services
    @Environment(\.dismiss) private var dismiss

    private let item: PantryItem?
    @State private var name: String
    @State private var category: FoodCategory
    @State private var quantity: Double
    @State private var unit: String
    @State private var price: Double?
    @State private var purchasedOn: Date
    @State private var expiresOn: Date

    init(item: PantryItem? = nil) {
        self.item = item
        _name = State(initialValue: item?.name ?? "")
        _category = State(initialValue: item?.category ?? .other)
        _quantity = State(initialValue: item?.quantity ?? 1)
        _unit = State(initialValue: item?.unit ?? "")
        _price = State(initialValue: item?.price)
        _purchasedOn = State(initialValue: item?.purchasedOn ?? .now)
        _expiresOn = State(initialValue: item?.expiresOn ?? .now)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Name", text: $name)
                    Picker("Category", selection: $category) {
                        ForEach(FoodCategory.allCases) { option in
                            Label(option.displayName, systemImage: option.symbol).tag(option)
                        }
                    }
                }

                Section("Quantity") {
                    TextField("Quantity", value: $quantity, format: .number)
                        .keyboardType(.decimalPad)
                    TextField("Unit", text: $unit)
                }

                Section {
                    TextField("Price", value: $price, format: .currency(code: "USD"))
                        .keyboardType(.decimalPad)
                }

                Section {
                    DatePicker("Purchased", selection: $purchasedOn, displayedComponents: .date)
                    DatePicker("Expires", selection: $expiresOn, displayedComponents: .date)
                }

                if item == nil {
                    Section {
                        // TODO(backend): replace category defaults with per-item shelf-life lookup.
                        BackendPlaceholderBanner("expiry estimates use category defaults")
                    }
                }
            }
            .navigationTitle(item == nil ? "New Item" : "Edit Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save", action: save)
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear(perform: fillExpiry)
            .onChange(of: category) { _, _ in fillExpiry() }
            .onChange(of: purchasedOn) { _, _ in fillExpiry() }
        }
    }

    private func fillExpiry() {
        guard item == nil else { return }
        expiresOn = services.expiration.estimatedExpiry(for: category, purchasedOn: purchasedOn)
    }

    private func save() {
        if let item {
            pantry.update(PantryItem(id: item.id, name: name, category: category, quantity: quantity, unit: unit,
                                     price: price, purchasedOn: purchasedOn, expiresOn: expiresOn,
                                     sharedCircleID: item.sharedCircleID))
        } else {
            pantry.add([PantryItem(name: name, category: category, quantity: quantity, unit: unit,
                                   price: price, purchasedOn: purchasedOn, expiresOn: expiresOn)])
        }
        dismiss()
    }
}

#Preview {
    PantryItemEditor()
        .environment(PantryStore(items: MockData.pantryItems, services: .mock))
}
