import SwiftUI

struct CirclesView: View {
    @Environment(CircleStore.self) private var circles
    @State private var isCreatingCircle = false
    @State private var newCircleName = ""

    var body: some View {
        VStack(spacing: 0) {
            // TODO(backend): circles come from the mock service until the backend exists.
            BackendPlaceholderBanner("Circles are local sample data")
                .padding(Theme.Spacing.l)
            if circles.circles.isEmpty {
                ContentUnavailableView("No circles yet",
                                       systemImage: "person.2",
                                       description: Text("Create a circle to share pantry items with the people you live with."))
            } else {
                List(circles.circles) { circle in
                    NavigationLink {
                        CircleDetailView(circleID: circle.id)
                    } label: {
                        HStack(spacing: Theme.Spacing.m) {
                            HStack(spacing: -Theme.Spacing.s) {
                                ForEach(circle.members) { member in
                                    MemberAvatar(member: member)
                                }
                            }
                            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                                Text(circle.name)
                                    .font(Theme.Fonts.headline)
                                Text("\(circle.sharedItems.count) shared items")
                                    .font(Theme.Fonts.caption)
                                    .foregroundStyle(Theme.Colors.textSecondary)
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("Circles")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("New circle", systemImage: "plus") {
                    isCreatingCircle = true
                }
            }
        }
        .alert("New circle", isPresented: $isCreatingCircle) {
            TextField("Name", text: $newCircleName)
            Button("Create") {
                let name = newCircleName.trimmingCharacters(in: .whitespacesAndNewlines)
                newCircleName = ""
                guard !name.isEmpty else { return }
                // TODO(backend): owner should be the signed-in user.
                circles.createCircle(named: name, owner: CircleMember(name: "You"))
            }
            Button("Cancel", role: .cancel) {
                newCircleName = ""
            }
        }
    }
}

struct MemberAvatar: View {
    let member: CircleMember
    var size: CGFloat = 32

    var body: some View {
        Text(member.initials)
            .font(.system(size: size * 0.4, weight: .semibold))
            .foregroundStyle(Theme.Colors.textPrimary)
            .frame(width: size, height: size)
            .background(Theme.Colors.accent.opacity(0.2), in: Circle())
            .overlay(Circle().stroke(Theme.Colors.background, lineWidth: 2))
    }
}

#Preview {
    let circles = CircleStore(services: .mock)
    return NavigationStack { CirclesView() }
        .environment(circles)
        .task { await circles.load() }
}
