import SwiftUI

struct CircleDetailView: View {
    @Environment(CircleStore.self) private var circles
    let circleID: UUID
    @State private var email = ""
    @State private var inviteResult: String?

    private var circle: FoodCircle? {
        circles.circles.first { $0.id == circleID }
    }

    var body: some View {
        Group {
            if let circle {
                Form {
                    Section("Members") {
                        ForEach(circle.members) { member in
                            HStack(spacing: Theme.Spacing.m) {
                                MemberAvatar(member: member)
                                Text(member.name)
                            }
                        }
                    }
                    Section("Shared items") {
                        if circle.sharedItems.isEmpty {
                            Text("Nothing shared yet")
                                .foregroundStyle(Theme.Colors.textSecondary)
                        }
                        ForEach(circle.sharedItems) { item in
                            HStack(spacing: Theme.Spacing.m) {
                                CategoryIcon(category: item.category, size: 28)
                                Text(item.name)
                                Spacer()
                                ExpiryBadge(item: item)
                            }
                        }
                    }
                    Section {
                        // TODO(backend): invites are not sent; service is a placeholder.
                        BackendPlaceholderBanner("Invites are not sent yet")
                        TextField("Email", text: $email)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                        Button("Send invite") {
                            Task { await sendInvite() }
                        }
                        .disabled(email.isEmpty)
                    } header: {
                        Text("Invite")
                    } footer: {
                        if let inviteResult {
                            Text(inviteResult)
                        }
                    }
                }
            } else {
                ContentUnavailableView("Circle not found", systemImage: "person.2.slash")
            }
        }
        .navigationTitle(circle?.name ?? "Circle")
    }

    private func sendInvite() async {
        do {
            try await circles.invite(email: email, to: circleID)
            inviteResult = "Invite sent (placeholder)"
        } catch {
            inviteResult = error.localizedDescription
        }
    }
}

#Preview {
    let circles = CircleStore(services: .mock)
    return NavigationStack { CircleDetailView(circleID: UUID()) }
        .environment(circles)
        .task { await circles.load() }
}
