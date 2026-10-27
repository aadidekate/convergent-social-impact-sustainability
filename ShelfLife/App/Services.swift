import SwiftUI

/// Backend seams. Swap mocks for real implementations here.
struct Services {
    var receiptScan: any ReceiptScanService
    var expiration: any ExpirationService
    var recipes: any RecipeService
    var circles: any CircleService
    var analytics: any AnalyticsService
    var notifications: ExpiryNotificationService

    static let mock: Services = {
        let expiration = MockExpirationService()
        return Services(receiptScan: MockReceiptScanService(expiration: expiration),
                        expiration: expiration,
                        recipes: MockRecipeService(),
                        circles: MockCircleService(),
                        analytics: MockAnalyticsService(),
                        notifications: ExpiryNotificationService())
    }()
}

extension EnvironmentValues {
    @Entry var services: Services = .mock
}
