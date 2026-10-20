import SwiftUI

struct SharePantryItemSheet: View {
    @Environment(CircleStore.self) private var circles
    @Environment(\.dismiss) private var dismiss
    let item: PantryItem
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Group {
                if circles.circles.isEmpty {
                    ContentUnavailableView("No circles yet",
                                           systemImage: "person.2",
                                           description: Text("Create a circle first to share \(item.name)."))
                } else {
                    List {
                        ForEach(circles.circles) { circle in
                            Button {
                                Task { await share(with: circle.id) }
                            } label: {
                                Text(circle.name)
                            }
                        }
                        if let errorMessage {
                            Section {
                                Text(errorMessage)
                                    .foregroundStyle(.red)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Share \(item.name)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }

    private func share(with circleID: UUID) async {
        do {
            try await circles.share(item, with: circleID)
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

#Preview {
    let circles = CircleStore(services: .mock)
    return SharePantryItemSheet(item: PantryItem(name: "Spinach",
                                                 category: .produce,
                                                 quantity: 1,
                                                 unit: "bag",
                                                 price: nil,
                                                 purchasedOn: .now,
                                                 expiresOn: .now))
        .environment(circles)
        .task { await circles.load() }
}
