import SwiftUI

struct BackendPlaceholderBanner: View {
    private let message: String

    init(_ message: String) {
        self.message = message
    }

    var body: some View {
        Label("Backend not connected: \(message)", systemImage: "server.rack")
            .font(Theme.Fonts.caption)
            .foregroundStyle(Theme.Colors.textSecondary)
            .padding(Theme.Spacing.m)
            .frame(maxWidth: .infinity)
            .overlay {
                RoundedRectangle(cornerRadius: Theme.Radius.card)
                    .strokeBorder(Theme.Colors.textSecondary, style: StrokeStyle(lineWidth: 1, dash: [6, 4]))
            }
    }
}

#Preview {
    BackendPlaceholderBanner("pantry sync")
        .padding()
        .background(Theme.Colors.background)
}
