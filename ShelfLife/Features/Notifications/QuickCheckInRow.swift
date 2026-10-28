//
//  QuickCheckInRow.swift
//  ShelfLife
//
//  Created by Kaylee Zheng on 10/27/26.
//

import SwiftUI

struct QuickCheckInRow: View {
    let itemName: String
    let expiryText: String
    @State var quantity: Int
    
    var body: some View {
        HStack(spacing: Theme.Spacing.m) {
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(itemName)
                    .font(Theme.Fonts.headline)
                    .foregroundStyle(Theme.Colors.textPrimary)
                Text(expiryText)
                    .font(Theme.Fonts.caption)
                    .foregroundStyle(Theme.Colors.soon)
            }
            
            Spacer()
            
            // Tap-friendly quantity adjustments (no typing)
            HStack(spacing: Theme.Spacing.m) {
                Button {
                    if quantity > 0 { quantity -= 1 }
                } label: {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 28))
                        .foregroundStyle(Theme.Colors.expired)
                }
                
                Text("\(quantity)")
                    .font(Theme.Fonts.headline)
                    .frame(minWidth: 24, alignment: .center)
                
                Button {
                    quantity += 1
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 28))
                        .foregroundStyle(Theme.Colors.fresh)
                }
            }
        }
        .padding(Theme.Spacing.l)
        .background(Theme.Colors.surface)
        .cornerRadius(Theme.Radius.card)
    }
}
