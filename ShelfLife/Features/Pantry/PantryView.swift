import SwiftUI

struct PantryView: View {
    @Environment(PantryStore.self) private var pantry

    @State private var query = ""
    @State private var selectedFilter: Filter = .all
    @State private var showingNewItem = false

    private var filters: [Filter] {
        [.all, .expiring] + FoodCategory.allCases.map(Filter.category)
    }

    private var filteredItems: [PantryItem] {
        pantry.sortedByExpiry.filter { item in
            matches(item, filter: selectedFilter)
                && (query.isEmpty || item.name.localizedCaseInsensitiveContains(query))
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if pantry.items.isEmpty {
                    ContentUnavailableView("Pantry Is Empty", systemImage: "refrigerator", description: Text("Add an item or scan a receipt."))
                } else {
                    VStack(spacing: Theme.Spacing.m) {
                        if !pantry.expiringSoon.isEmpty {
                            expiringSoonStrip
                        }
                        filterPills
                        itemList
                    }
                }
            }
            .searchable(text: $query, prompt: "Search pantry")
            .navigationTitle("Pantry")
            .toolbar {
                ToolbarItemGroup(placement: .topBarLeading) {
                    NavigationLink {
                        CirclesView()
                    } label: {
                        Image(systemName: "person.2")
                    }
                    NavigationLink {
                        SettingsView()
                    } label: {
                        Image(systemName: "gearshape")
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingNewItem = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .accessibilityLabel("Add item")
                }
            }
            .sheet(isPresented: $showingNewItem) {
                PantryItemEditor()
            }
        }
    }

    private var expiringSoonStrip: some View {
        Card {
            HStack {
                Label("Expiring soon", systemImage: "exclamationmark.triangle")
                    .font(Theme.Fonts.headline)
                    .foregroundStyle(Theme.Colors.soon)
                Spacer()
                Text("\(pantry.expiringSoon.count)")
                    .font(Theme.Fonts.title)
                    .foregroundStyle(Theme.Colors.textPrimary)
            }
        }
        .padding(.horizontal, Theme.Spacing.l)
    }

    private var filterPills: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Theme.Spacing.s) {
                ForEach(filters, id: \.self) { filter in
                    Button {
                        selectedFilter = filter
                    } label: {
                        Pill(filter.title, isSelected: selectedFilter == filter)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, Theme.Spacing.l)
        }
    }

    @ViewBuilder
    private var itemList: some View {
        if filteredItems.isEmpty {
            ContentUnavailableView("No Items", systemImage: "line.3.horizontal.decrease.circle", description: Text("Try another filter or search."))
        } else {
            List {
                ForEach(filteredItems) { item in
                    NavigationLink {
                        PantryItemDetailView(item: item)
                    } label: {
                        row(for: item)
                    }
                    .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                        Button("Used") {
                            pantry.remove(item, reason: .used)
                        }
                        .tint(.green)
                        Button("Wasted") {
                            pantry.remove(item, reason: .wasted)
                        }
                        .tint(.red)
                    }
                }
            }
            .listStyle(.plain)
        }
    }

    private func row(for item: PantryItem) -> some View {
        HStack(spacing: Theme.Spacing.m) {
            CategoryIcon(category: item.category)
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(item.name)
                    .font(Theme.Fonts.headline)
                    .foregroundStyle(Theme.Colors.textPrimary)
                Text("\(item.quantity.formatted()) \(item.unit)")
                    .font(Theme.Fonts.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
            Spacer()
            ExpiryBadge(item: item)
        }
    }

    private func matches(_ item: PantryItem, filter: Filter) -> Bool {
        switch filter {
        case .all: true
        case .expiring: item.status() != .fresh
        case .category(let category): item.category == category
        }
    }

    private enum Filter: Hashable {
        case all, expiring, category(FoodCategory)

        var title: String {
            switch self {
            case .all: "All"
            case .expiring: "Expiring"
            case .category(let category): category.displayName
            }
        }
    }
}

#Preview {
    PantryView()
        .environment(PantryStore(items: MockData.pantryItems, services: .mock))
}
