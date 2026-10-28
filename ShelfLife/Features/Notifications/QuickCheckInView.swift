//
//  QuickCheckInView.swift
//  ShelfLife
//
//  Created by Kaylee Zheng on 10/27/26.
//

import SwiftUI

struct QuickCheckInView: View {
    @Environment(PantryStore.self) private var pantry
    @Environment(\.dismiss) private var dismiss
    
    @State private var itemsToCheck: [PantryItem]
    @State private var currentIndex: Int = 0
    @State private var showingAdjustmentView = false
    
    // Drag offset for bouncy card animation feedback
    @State private var dragOffset: CGSize = .zero
    @State private var cardRotation: Double = 0
    
    init(items: [PantryItem]) {
        _itemsToCheck = State(initialValue: items)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: Theme.Spacing.l) {
                if itemsToCheck.isEmpty || currentIndex >= itemsToCheck.count {
                    ContentUnavailableView(
                        "All Caught Up!",
                        systemImage: "checkmark.circle.fill",
                        description: Text("You've checked all your inventory items.")
                    )
                    .foregroundStyle(Theme.Colors.fresh)
                    
                    Button("Done") {
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)
                    .padding()
                } else {
                    let currentItem = itemsToCheck[currentIndex]
                    
                    Text("Item \(currentIndex + 1) of \(itemsToCheck.count)")
                        .font(Theme.Fonts.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                        .padding(.top)
                    
                    Spacer()
                    
                    // Bouncy Stack Card
                    VStack(spacing: Theme.Spacing.m) {
                        CategoryIcon(category: currentItem.category)
                            .scaleEffect(1.6)
                            .padding(.bottom, Theme.Spacing.s)
                        
                        Text(currentItem.name)
                            .font(Theme.Fonts.title)
                            .foregroundStyle(Theme.Colors.textPrimary)
                        
                        Text("Current: \(currentItem.quantity.formatted()) \(currentItem.unit)")
                            .font(Theme.Fonts.body)
                            .foregroundStyle(Theme.Colors.textSecondary)
                        
                        ExpiryBadge(item: currentItem)
                        
                        Divider().padding(.vertical, Theme.Spacing.xs)
                        
                        // Smaller Subtitle Instructions
                        HStack {
                            Label("Swipe Right: none left", systemImage: "arrow.left")
                            Spacer()
                            Label("Swipe Left: still have", systemImage: "arrow.right")
                        }
                        .font(.system(size: 11, weight: .medium, design: .rounded))
                        .foregroundStyle(Theme.Colors.textSecondary.opacity(0.8))
                        .padding(.horizontal, Theme.Spacing.xs)
                    }
                    .padding(Theme.Spacing.xl)
                    .frame(maxWidth: .infinity, minHeight: 280)
                    .background(Theme.Colors.surface.opacity(0.35))
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.card))
                    .shadow(color: Color.black.opacity(0.08), radius: 10, x: 0, y: 5)
                    .padding(.horizontal, Theme.Spacing.l)
                    // Apply bouncy drag & rotation transforms
                    .offset(x: dragOffset.width, y: dragOffset.height * 0.2)
                    .rotationEffect(.degrees(cardRotation))
                    .gesture(
                        DragGesture()
                            .onChanged { value in
                                dragOffset = value.translation
                                cardRotation = Double(value.translation.width / 15)
                            }
                            .onEnded { value in
                                withAnimation(.spring(response: 0.35, dampingFraction: 0.55)) {
                                    if value.translation.width > 90 {
                                        // Swiped Right -> Don't have it (Remove/Wasted)
                                        dragOffset = CGSize(width: 500, height: 0)
                                        cardRotation = 25
                                        triggerRemoval(item: currentItem)
                                    } else if value.translation.width < -90 {
                                        // Swiped Left -> Still have it (Open +/- adjustments)
                                        dragOffset = CGSize(width: -500, height: 0)
                                        cardRotation = -25
                                        triggerAdjustment()
                                    } else {
                                        // Snap back if not dragged far enough
                                        dragOffset = .zero
                                        cardRotation = 0
                                    }
                                }
                            }
                    )
                    
                    Spacer()
                    
                    // Backup Action Buttons with bouncy spring animation triggers
                    HStack(spacing: Theme.Spacing.l) {
                        Button(role: .destructive) {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                                triggerRemoval(item: currentItem)
                            }
                        } label: {
                            Label("Don't Have", systemImage: "xmark.circle.fill")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                        
                        Button {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                                triggerAdjustment()
                            }
                        } label: {
                            Label("Still Have (+/-)", systemImage: "checkmark.circle.fill")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Theme.Colors.accent)
                    }
                    .padding(.horizontal, Theme.Spacing.l)
                    .padding(.bottom)
                }
            }
            .navigationTitle("Quick Check-In")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showingAdjustmentView) {
                if currentIndex < itemsToCheck.count {
                    QuickCheckInAdjustmentView(item: itemsToCheck[currentIndex]) {
                        advanceToNextCard()
                    }
                }
            }
        }
    }
    
    private func triggerRemoval(item: PantryItem) {
        pantry.remove(item, reason: .used)
        advanceToNextCard()
    }
    
    private func triggerAdjustment() {
        showingAdjustmentView = true
    }
    
    private func advanceToNextCard() {
        showingAdjustmentView = false
        dragOffset = .zero
        cardRotation = 0
        currentIndex += 1
    }
}

// Sub-page with +/- quantity steppers
struct QuickCheckInAdjustmentView: View {
    @Environment(PantryStore.self) private var pantry
    @Environment(\.dismiss) private var dismiss
    
    @State var item: PantryItem
    var onComplete: () -> Void

    var body: some View {
        NavigationStack {
            VStack(spacing: Theme.Spacing.xl) {
                Text("Update Quantity for")
                    .font(Theme.Fonts.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                
                Text(item.name)
                    .font(Theme.Fonts.title)
                
                HStack(spacing: Theme.Spacing.xl) {
                    Button {
                        if item.quantity > 0.5 {
                            item.quantity -= 0.5
                        }
                    } label: {
                        Image(systemName: "minus.circle.fill")
                            .font(.system(size: 40))
                            .foregroundStyle(Theme.Colors.accent)
                    }
                    
                    Text("\(item.quantity.formatted()) \(item.unit)")
                        .font(Theme.Fonts.largeTitle)
                        .frame(minWidth: 120, alignment: .center)
                    
                    Button {
                        item.quantity += 0.5
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 40))
                            .foregroundStyle(Theme.Colors.accent)
                    }
                }
                .padding()
                
                Spacer()
                
                Button("Save Changes") {
                    pantry.update(item)
                    onComplete()
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .tint(Theme.Colors.accent)
                .controlSize(.large)
            }
            .padding()
            .navigationTitle("Adjust Quantity")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
