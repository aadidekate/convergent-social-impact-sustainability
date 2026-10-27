import SwiftUI

struct Pill: View {
    private let text: String
    private let systemImage: String?
    private let isSelected: Bool

    init(_ text: String, systemImage: String? = nil, isSelected: Bool = false) {
        self.text = text
        self.systemImage = systemImage
        self.isSelected = isSelected
    }

    var body: some View {
        HStack(spacing: Theme.Spacing.xs) {
            if let systemImage {
                Image(systemName: systemImage)
            }
            Text(text)
        }
        .font(Theme.Fonts.caption)
        .foregroundStyle(isSelected ? Color.white : Theme.Colors.textPrimary)
        .padding(.horizontal, Theme.Spacing.m)
        .padding(.vertical, Theme.Spacing.s)
        .background(isSelected ? Theme.Colors.accent : Theme.Colors.surface, in: Capsule())
    }
}

#Preview {
    HStack {
        Pill("All", isSelected: true)
        Pill("Dairy", systemImage: "cup.and.saucer")
        Pill("Produce")
    }
    .padding()
    .background(Theme.Colors.background)
}
