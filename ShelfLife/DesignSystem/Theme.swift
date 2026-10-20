import SwiftUI

// Tokens pending Figma sync.
enum Theme {
    enum Colors {
        static let accent = Color(red: 0.18, green: 0.6, blue: 0.4)
        static let background = Color(uiColor: .systemGroupedBackground)
        static let surface = Color(uiColor: .secondarySystemGroupedBackground)
        static let textPrimary = Color.primary
        static let textSecondary = Color.secondary
        static let fresh = Color(red: 0.18, green: 0.6, blue: 0.4)
        static let soon = Color.orange
        static let expired = Color.red
    }

    enum Spacing {
        static let xs: CGFloat = 4
        static let s: CGFloat = 8
        static let m: CGFloat = 12
        static let l: CGFloat = 16
        static let xl: CGFloat = 24
    }

    enum Radius {
        static let card: CGFloat = 14
        static let pill: CGFloat = 999
    }

    enum Fonts {
        static let largeTitle = Font.system(.largeTitle, design: .rounded, weight: .bold)
        static let title = Font.system(.title, design: .rounded, weight: .bold)
        static let headline = Font.system(.headline, design: .rounded, weight: .semibold)
        static let body = Font.system(.body, design: .rounded)
        static let caption = Font.system(.caption, design: .rounded)
    }
}

extension ExpiryStatus {
    var color: Color {
        switch self {
        case .fresh: Theme.Colors.fresh
        case .soon: Theme.Colors.soon
        case .expired: Theme.Colors.expired
        }
    }
}

#Preview {
    VStack(alignment: .leading, spacing: Theme.Spacing.m) {
        Text("Largest title").font(Theme.Fonts.largeTitle)
        Text("Title").font(Theme.Fonts.title)
        Text("Headline").font(Theme.Fonts.headline)
        Text("Body text").font(Theme.Fonts.body)
        Text("Caption").font(Theme.Fonts.caption).foregroundStyle(Theme.Colors.textSecondary)
        HStack(spacing: Theme.Spacing.s) {
            Circle().fill(Theme.Colors.fresh)
            Circle().fill(Theme.Colors.soon)
            Circle().fill(Theme.Colors.expired)
            Circle().fill(Theme.Colors.accent)
        }
        .frame(height: 24)
    }
    .padding(Theme.Spacing.xl)
    .background(Theme.Colors.background)
}
