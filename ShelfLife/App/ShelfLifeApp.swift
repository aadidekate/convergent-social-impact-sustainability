import SwiftUI
import UserNotifications

// 1. Modern iOS 17 Observable Router for Quick Check-In Popups
@Observable
class AppRouter {
    var selectedTab: Int = 0
    var shouldOpenQuickCheckIn: Bool = false
}

// 2. Delegate to handle notification interaction responses
class NotificationDelegate: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationDelegate()
    
    var onNotificationTapped: (() -> Void)?

    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        
        if let target = userInfo["target"] as? String, target == "quick_check_in" {
            DispatchQueue.main.async {
                self.onNotificationTapped?()
            }
        }
        
        completionHandler()
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .badge])
    }
}

@main
struct ShelfLifeApp: App {
    private let services = Services.mock
    @State private var pantry: PantryStore
    @State private var recipes: RecipeStore
    @State private var grocery: GroceryStore
    @State private var circles: CircleStore
    @State private var appRouter = AppRouter()

    init() {
        let services = Services.mock
        _pantry = State(initialValue: PantryStore(items: MockData.pantryItems, services: services))
        _recipes = State(initialValue: RecipeStore(saved: Array(MockData.recipes.prefix(2)), services: services))
        _grocery = State(initialValue: GroceryStore(lists: MockData.groceryLists, services: services))
        _circles = State(initialValue: CircleStore(services: services))
        
        UNUserNotificationCenter.current().delegate = NotificationDelegate.shared
    }

    var body: some Scene {
        WindowGroup {
            ZStack(alignment: .bottomTrailing) {
                RootTabView()
                    .environment(pantry)
                    .environment(recipes)
                    .environment(grocery)
                    .environment(circles)
                    .environment(\.services, services)
                    .environment(appRouter)
                    
                // Floating Test Button
                Button {
                    requestAndTriggerTestNotification()
                } label: {
                    Label("Test Notif", systemImage: "bell.badge.fill")
                        .font(.system(size: 14, weight: .bold))
                        .padding(12)
                        .background(Color.accentColor)
                        .foregroundColor(.white)
                        .clipShape(Capsule())
                        .shadow(radius: 4)
                }
                .padding()
            }
            .onAppear {
                NotificationDelegate.shared.onNotificationTapped = {
                    print("🚀 Notification banner tapped! Opening Quick Check-In popup...")
                    appRouter.shouldOpenQuickCheckIn = true
                }
            }
            .task {
                do {
                    let granted = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound])
                    print("🔔 Notification Permission Granted: \(granted)")
                } catch {
                    print("❌ Authorization error: \(error.localizedDescription)")
                }
                
                await services.notifications.requestAuthorization()
                pantry.rescheduleNotifications()
                await circles.load()
            }
        }
    }

    private func requestAndTriggerTestNotification() {
        Task {
            do {
                let granted = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound])
                guard granted else { return }
                
                let content = UNMutableNotificationContent()
                content.title = "ShelfLife Check-in 🍎"
                content.body = "Do you still have items like Baby Spinach or Whole Milk? Tap to check in."
                content.sound = .default
                content.userInfo = ["target": "quick_check_in"]
                
                let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 2, repeats: false)
                let request = UNNotificationRequest(identifier: "test-\(UUID().uuidString)", content: content, trigger: trigger)
                
                try await UNUserNotificationCenter.current().add(request)
                print("✅ Unique test notification scheduled! Press Shift + Command + H now.")
            } catch {
                print("❌ Failed to schedule: \(error.localizedDescription)")
            }
        }
    }
}
