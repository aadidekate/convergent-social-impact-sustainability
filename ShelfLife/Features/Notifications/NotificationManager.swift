import UserNotifications
import SwiftUI

class NotificationManager: NSObject, ObservableObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationManager()
    
    @Published var permissionGranted = false

    override init() {
        super.init()
        // Set the notification center delegate so notifications show up while app is open
        UNUserNotificationCenter.current().delegate = self
    }

    func requestPermissionAndSchedule() {
        let center = UNUserNotificationCenter.current()
        center.requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            DispatchQueue.main.async {
                self.permissionGranted = granted
                if granted {
                    print("Notification permission granted! Scheduling...")
                    self.scheduleBiWeeklyCheckIns()
                } else if let error = error {
                    print("Permission error: \(error.localizedDescription)")
                }
            }
        }
    }

    func scheduleBiWeeklyCheckIns() {
        let center = UNUserNotificationCenter.current()
        center.removeAllPendingNotificationRequests()
        
        let weekdays = [4, 1] // Wednesday, Sunday
        
        for weekday in weekdays {
            let content = UNMutableNotificationContent()
            content.title = "Bi-Weekly Check-in!"
            content.body = "Do you still have items about to go bad? Tap to quickly update your inventory."
            content.sound = .default
            
            // Testing trigger: fires in 5 seconds
            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
            
            let request = UNNotificationRequest(identifier: "shelf-life-checkin-\(weekday)", content: content, trigger: trigger)
            
            center.add(request) { error in
                if let error = error {
                    print("Error scheduling notification: \(error.localizedDescription)")
                } else {
                    print("Successfully scheduled test notification for weekday \(weekday)")
                }
            }
        }
    }

    // REQUIRED: This tells iOS to display the banner even when the app is actively open on screen
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .badge])
    }
}
