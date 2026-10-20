import SwiftUI

struct GroceryListDetailView: View {
    @Environment(GroceryStore.self) private var grocery
    @Environment(PantryStore.self) private var pantry
    let listID: UUID

    @State private var newItemName = ""
    @State private var newItemCategory: FoodCategory = .other
    @State private var movedCount = 0
    @State private var isShowingMoved = false

    init(listID: UUID) {
        self.listID = listID
    }

    private var list: GroceryList? { grocery.lists.first { $0.id == listID } }

    private var trimmedNewItemName: String { newItemName.trimmingCharacters(in: .whitespaces) }

    var body: some View {
        Group {
            if let list {
                itemList(list)
            } else {
                ContentUnavailableView("List Not Found", systemImage: "checklist")
            }
        }
        .navigationTitle(list?.name ?? "Grocery List")
        .alert("Added \(movedCount) \(movedCount == 1 ? "item" : "items") to pantry", isPresented: $isShowingMoved) {
            Button("OK", role: .cancel) {}
        }
    }

    private func itemList(_ list: GroceryList) -> some View {
        List {
            addItemSection
            ForEach(FoodCategory.allCases) { category in
                let items = sortedItems(in: category, of: list)
                if !items.isEmpty {
                    Section(category.displayName) {
                        ForEach(items) { item in
                            itemRow(item)
                        }
                    }
                }
            }
        }
        .toolbar {
            ToolbarItem(placement: .bottomBar) {
                Button("Move Checked to Pantry") {
                    let checked = grocery.takeChecked(from: listID)
                    pantry.add(checked)
                    movedCount = checked.count
                    isShowingMoved = true
                }
                .disabled(!list.items.contains(where: \.isChecked))
            }
        }
    }

    private var addItemSection: some View {
        Section {
            HStack {
                TextField("Item name", text: $newItemName)
                    .onSubmit(addItem)
                Menu {
                    Picker("Category", selection: $newItemCategory) {
                        ForEach(FoodCategory.allCases) { category in
                            Text(category.displayName).tag(category)
                        }
                    }
                } label: {
                    Label(newItemCategory.displayName, systemImage: newItemCategory.symbol)
                        .labelStyle(.iconOnly)
                }
                Button("Add", action: addItem)
                    .disabled(trimmedNewItemName.isEmpty)
            }
        }
    }

    private func itemRow(_ item: GroceryItem) -> some View {
        HStack {
            Button {
                grocery.toggle(item.id, in: listID)
            } label: {
                Image(systemName: item.isChecked ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(item.isChecked ? Theme.Colors.accent : .secondary)
            }
            .buttonStyle(.plain)
            Text(item.name)
                .strikethrough(item.isChecked)
                .foregroundStyle(item.isChecked ? .secondary : .primary)
            Spacer()
            Text("\(item.quantity.formatted()) \(item.unit)")
                .foregroundStyle(.secondary)
        }
        .swipeActions {
            Button(role: .destructive) {
                grocery.remove(item.id, from: listID)
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
    }

    /// Unchecked items first.
    private func sortedItems(in category: FoodCategory, of list: GroceryList) -> [GroceryItem] {
        list.items
            .filter { $0.category == category }
            .sorted { !$0.isChecked && $1.isChecked }
    }

    private func addItem() {
        guard !trimmedNewItemName.isEmpty else { return }
        grocery.add(GroceryItem(name: trimmedNewItemName, category: newItemCategory, quantity: 1, unit: "ct"),
                    to: listID)
        newItemName = ""
    }
}

#Preview {
    NavigationStack {
        GroceryListDetailView(listID: MockData.groceryLists[0].id)
    }
    .environment(GroceryStore(lists: MockData.groceryLists, services: .mock))
    .environment(PantryStore(items: MockData.pantryItems, services: .mock))
}
