import UserNotifications

/// Local expiry reminders. One notification per day, listing everything hitting its lead time that day,
/// to stay under iOS's 64 pending-notification cap.
struct ExpiryNotificationService {
    private let center = UNUserNotificationCenter.current()
    private let idPrefix = "expiry-"
    private let reminderHour = 9
    private let maxPending = 60

    @discardableResult
    func requestAuthorization() async -> Bool {
        (try? await center.requestAuthorization(options: [.alert, .sound, .badge])) ?? false
    }

    func reschedule(for items: [PantryItem], leadDays: Int) async {
        let pending = await center.pendingNotificationRequests().map(\.identifier).filter { $0.hasPrefix(idPrefix) }
        center.removePendingNotificationRequests(withIdentifiers: pending)

        let calendar = Calendar.current
        let byDay = Dictionary(grouping: items) { item in
            calendar.date(byAdding: .day, value: -leadDays, to: calendar.startOfDay(for: item.expiresOn))!
        }
        let today = calendar.startOfDay(for: .now)
        for (day, dueItems) in byDay.filter({ $0.key >= today }).sorted(by: { $0.key < $1.key }).prefix(maxPending) {
            var components = calendar.dateComponents([.year, .month, .day], from: day)
            components.hour = reminderHour
            guard let fireDate = calendar.date(from: components), fireDate > .now else { continue }

            let content = UNMutableNotificationContent()
            content.title = leadDays == 0 ? "Expiring today" : "Expiring in \(leadDays) day\(leadDays == 1 ? "" : "s")"
            content.body = dueItems.map(\.name).sorted().joined(separator: ", ")
            content.sound = .default
            let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
            try? await center.add(UNNotificationRequest(identifier: idPrefix + day.ISO8601Format(),
                                                        content: content, trigger: trigger))
        }
    }

    func sendTest() async {
        let content = UNMutableNotificationContent()
        content.title = "ShelfLife test"
        content.body = "Spinach expires tomorrow. Try the Spinach Omelette recipe."
        content.sound = .default
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
        try? await center.add(UNNotificationRequest(identifier: "test-\(UUID())", content: content, trigger: trigger))
    }
}
