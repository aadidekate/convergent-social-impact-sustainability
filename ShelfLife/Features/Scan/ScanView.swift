import SwiftUI
import UIKit
import VisionKit

struct ScanView: View {
    @Environment(\.services) private var services

    @State private var isScanning = false
    @State private var isParsing = false
    @State private var parsedReceipt: Receipt?
    @State private var isShowingError = false
    @State private var errorMessage = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.Spacing.l) {
                    Card {
                        VStack(alignment: .leading, spacing: Theme.Spacing.s) {
                            Image(systemName: "doc.viewfinder")
                                .font(Theme.Fonts.largeTitle)
                                .foregroundStyle(Theme.Colors.accent)
                            Text("Scan a receipt")
                                .font(Theme.Fonts.title)
                            Text("Point the camera at a grocery receipt. We'll pull out the items, prices, and estimated expiry dates so you can stock your pantry in one step.")
                                .font(Theme.Fonts.body)
                                .foregroundStyle(Theme.Colors.textSecondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    BackendPlaceholderBanner("Receipt OCR returns sample data")

                    if isParsing {
                        ProgressView("Reading receipt…")
                    } else {
                        VStack(spacing: Theme.Spacing.s) {
                            Button("Scan receipt", systemImage: "doc.viewfinder") {
                                isScanning = true
                            }
                            .buttonStyle(.borderedProminent)
                            .disabled(!VNDocumentCameraViewController.isSupported)

                            if !VNDocumentCameraViewController.isSupported {
                                Text("Camera unavailable (simulator)")
                                    .font(Theme.Fonts.caption)
                                    .foregroundStyle(Theme.Colors.textSecondary)
                            }

                            // TODO(backend): remove sample path once real OCR is wired to the camera flow.
                            Button("Use sample receipt") {
                                Task { await parse([]) }
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                }
                .padding(Theme.Spacing.l)
            }
            .navigationTitle("Scan Receipt")
            .navigationDestination(item: $parsedReceipt) { receipt in
                ReceiptReviewView(receipt: receipt)
            }
            .fullScreenCover(isPresented: $isScanning) {
                DocumentScannerView(
                    onScan: { pages in
                        isScanning = false
                        Task { await parse(pages) }
                    },
                    onCancel: { isScanning = false }
                )
            }
            .alert("Couldn't read receipt", isPresented: $isShowingError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage)
            }
        }
    }

    private func parse(_ pages: [UIImage]) async {
        isParsing = true
        defer { isParsing = false }
        do {
            parsedReceipt = try await services.receiptScan.parseReceipt(from: pages)
        } catch {
            errorMessage = error.localizedDescription
            isShowingError = true
        }
    }
}

#Preview {
    ScanView()
        .environment(PantryStore(items: MockData.pantryItems, services: .mock))
}
