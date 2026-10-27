import Charts
import SwiftUI

struct InsightsView: View {
    @Environment(\.services) private var services
    @State private var reports: [MonthlyReport]?

    var body: some View {
        NavigationStack {
            Group {
                if let reports, let current = reports.last {
                    ScrollView {
                        VStack(spacing: Theme.Spacing.l) {
                            // TODO(backend): replace sample reports with aggregated receipts and removal events.
                            BackendPlaceholderBanner("Spending and waste use sample data")
                            summaryCard(current, previous: reports.dropLast().last)
                            spendCard(reports)
                            trendCard(reports)
                            wastedCategoryCard(current)
                        }
                        .padding(Theme.Spacing.l)
                    }
                } else if reports == nil {
                    ProgressView()
                } else {
                    ContentUnavailableView("No Data Yet", systemImage: "chart.bar",
                                           description: Text("Scan receipts to see spending and waste."))
                }
            }
            .navigationTitle("Insights")
            .task {
                reports = await services.analytics.monthlyReports(months: 6)
            }
        }
    }

    private func summaryCard(_ report: MonthlyReport, previous: MonthlyReport?) -> some View {
        let wastePercent = report.spent > 0 ? report.wastedValue / report.spent : 0
        return Card {
            VStack(alignment: .leading, spacing: Theme.Spacing.s) {
                Text("This month").font(Theme.Fonts.headline)
                LabeledContent("Spent", value: report.spent.formatted(.currency(code: "USD")))
                LabeledContent("Wasted", value: report.wastedValue.formatted(.currency(code: "USD")))
                LabeledContent("Wasted items", value: report.wastedItemCount.formatted())
                LabeledContent("Waste % of spend", value: wastePercent.formatted(.percent.precision(.fractionLength(0))))
                if let previous {
                    let change = report.wastedValue - previous.wastedValue
                    Group {
                        if change == 0 {
                            Label("No change vs last month", systemImage: "equal")
                                .foregroundStyle(Theme.Colors.textSecondary)
                        } else {
                            Label("\(abs(change).formatted(.currency(code: "USD"))) vs last month",
                                  systemImage: change < 0 ? "arrow.down.right" : "arrow.up.right")
                                .foregroundStyle(change < 0 ? Theme.Colors.fresh : Theme.Colors.expired)
                        }
                    }
                    .font(Theme.Fonts.caption)
                }
            }
        }
    }

    private func spendCard(_ reports: [MonthlyReport]) -> some View {
        Card {
            VStack(alignment: .leading, spacing: Theme.Spacing.s) {
                Text("Spent vs wasted").font(Theme.Fonts.headline)
                Chart(reports) { report in
                    BarMark(x: .value("Month", report.month, unit: .month), y: .value("Amount", report.spent))
                        .foregroundStyle(by: .value("Series", "Spent"))
                        .position(by: .value("Series", "Spent"))
                    BarMark(x: .value("Month", report.month, unit: .month), y: .value("Amount", report.wastedValue))
                        .foregroundStyle(by: .value("Series", "Wasted"))
                        .position(by: .value("Series", "Wasted"))
                }
                .chartForegroundStyleScale(["Spent": Theme.Colors.accent, "Wasted": Theme.Colors.expired])
                .frame(height: 200)
            }
        }
    }

    private func trendCard(_ reports: [MonthlyReport]) -> some View {
        Card {
            VStack(alignment: .leading, spacing: Theme.Spacing.s) {
                Text("Waste trend").font(Theme.Fonts.headline)
                Chart(reports) { report in
                    LineMark(x: .value("Month", report.month, unit: .month), y: .value("Wasted", report.wastedValue))
                        .foregroundStyle(Theme.Colors.expired)
                    PointMark(x: .value("Month", report.month, unit: .month), y: .value("Wasted", report.wastedValue))
                        .foregroundStyle(Theme.Colors.expired)
                }
                .frame(height: 160)
            }
        }
    }

    private func wastedCategoryCard(_ report: MonthlyReport) -> some View {
        let ranked = report.wasteByCategory.sorted { $0.value > $1.value }.map { $0.key }
        return Card {
            VStack(alignment: .leading, spacing: Theme.Spacing.s) {
                Text("Most wasted this month").font(Theme.Fonts.headline)
                Chart(ranked) { category in
                    BarMark(x: .value("Wasted", report.wasteByCategory[category] ?? 0),
                            y: .value("Category", category.displayName))
                        .foregroundStyle(Theme.Colors.expired)
                }
                .frame(height: 220)
            }
        }
    }
}

#Preview {
    InsightsView()
}
