import SwiftUI

struct Card<Content: View>: View {
    private let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(Theme.Spacing.l)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.Colors.surface, in: RoundedRectangle(cornerRadius: Theme.Radius.card))
    }
}

#Preview {
    Card {
        Text("Greek yogurt")
            .font(Theme.Fonts.headline)
        Text("Expires in 3 days")
            .font(Theme.Fonts.caption)
            .foregroundStyle(Theme.Colors.textSecondary)
    }
    .padding()
    .background(Theme.Colors.background)
}
