import Foundation

protocol AnalyticsService {
    /// Most recent month last.
    func monthlyReports(months: Int) async -> [MonthlyReport]
    func recordRemoval(of item: PantryItem, reason: RemovalReason)
}

struct MockAnalyticsService: AnalyticsService {
    func monthlyReports(months: Int) async -> [MonthlyReport] {
        // TODO(backend): aggregate receipts + removal events per month.
        Array(MockData.monthlyReports.suffix(months))
    }

    func recordRemoval(of item: PantryItem, reason: RemovalReason) {
        // TODO(backend): log used/wasted event for analytics.
    }
}
