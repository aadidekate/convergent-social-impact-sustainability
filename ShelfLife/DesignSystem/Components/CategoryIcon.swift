import SwiftUI

struct CategoryIcon: View {
    private let category: FoodCategory
    private let size: CGFloat

    init(category: FoodCategory, size: CGFloat = 36) {
        self.category = category
        self.size = size
    }

    var body: some View {
        Image(systemName: category.symbol)
            .font(.system(size: size * 0.45))
            .foregroundStyle(Theme.Colors.accent)
            .frame(width: size, height: size)
            .background(Theme.Colors.surface, in: Circle())
    }
}

#Preview {
    HStack(spacing: Theme.Spacing.m) {
        ForEach(FoodCategory.allCases) { category in
            CategoryIcon(category: category)
        }
    }
    .padding()
    .background(Theme.Colors.background)
}
