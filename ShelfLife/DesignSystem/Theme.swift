import SwiftUI

// Tokens pending Figma sync.
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

enum Theme {
    enum Colors {
            static let accent = Color(hex: "354A39")
            static let background = Color(hex: "F3EADB")
            static let surface = Color(hex: "C4A07A")
            static let textPrimary = Color(hex: "354A39")
            static let textSecondary = Color(hex: "7C6D52")
            static let fresh = Color(hex: "CFD8C0")
            static let soon = Color(hex: "F0DCAE")
            static let expired = Color(hex: "EFD3C4")
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
