import Foundation

struct MonthlyReport: Identifiable, Hashable {
    /// First day of the month.
    var month: Date
    var spent: Double
    var wastedValue: Double
    var wastedItemCount: Int
    var wasteByCategory: [FoodCategory: Double]

    var id: Date { month }
}
