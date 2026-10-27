import SwiftUI

struct GroceryView: View {
    @Environment(GroceryStore.self) private var grocery
    @State private var isCreatingList = false
    @State private var newListName = ""

    var body: some View {
        NavigationStack {
            Group {
                if grocery.lists.isEmpty {
                    ContentUnavailableView("No Grocery Lists", systemImage: "checklist",
                                           description: Text("Tap + to start a list."))
                } else {
                    List {
                        ForEach(grocery.lists) { list in
                            NavigationLink {
                                GroceryListDetailView(listID: list.id)
                            } label: {
                                VStack(alignment: .leading) {
                                    Text(list.name)
                                    Text("\(list.items.filter(\.isChecked).count) of \(list.items.count) checked")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            .swipeActions {
                                Button(role: .destructive) {
                                    grocery.deleteList(list.id)
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Grocery Lists")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("New List", systemImage: "plus") {
                        newListName = ""
                        isCreatingList = true
                    }
                }
            }
            .alert("New Grocery List", isPresented: $isCreatingList) {
                TextField("Name", text: $newListName)
                Button("Cancel", role: .cancel) {}
                Button("Create", action: createList)
            }
        }
    }

    private func createList() {
        let name = newListName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }
        grocery.createList(named: name)
    }
}

#Preview {
    GroceryView()
        .environment(GroceryStore(lists: MockData.groceryLists, services: .mock))
}
