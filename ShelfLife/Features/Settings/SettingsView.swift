import SwiftUI

struct SettingsView: View {
    @Environment(\.services) private var services
    @Environment(PantryStore.self) private var pantry
    @AppStorage(PantryStore.leadDaysKey) private var leadDays = 1

    var body: some View {
        Form {
            Section {
                Button("Enable notifications") {
                    Task { await services.notifications.requestAuthorization() }
                }
                Picker("Remind me", selection: $leadDays) {
                    Text("Day of").tag(0)
                    Text("1 day before").tag(1)
                    Text("2 days before").tag(2)
                    Text("3 days before").tag(3)
                }
                .onChange(of: leadDays) {
                    pantry.rescheduleNotifications()
                }
                Button("Send test notification") {
                    Task { await services.notifications.sendTest() }
                }
            } header: {
                Text("Notifications")
            } footer: {
                Text("Arrives in 5 seconds. Lock the device to see it.")
            }

            Section {
                // TODO(backend): sign-in needs an account service.
                Label("Sign in", systemImage: "person.crop.circle")
                    .disabled(true)
                BackendPlaceholderBanner("Accounts need a backend")
            } header: {
                Text("Account")
            }

            Section("About") {
                LabeledContent("Version", value: version)
            }
        }
        .navigationTitle("Settings")
    }

    private var version: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "Unknown"
    }
}

#Preview {
    NavigationStack { SettingsView() }
        .environment(PantryStore(items: [], services: .mock))
}
