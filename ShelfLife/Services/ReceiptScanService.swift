import UIKit

protocol ReceiptScanService {
    func parseReceipt(from pages: [UIImage]) async throws -> Receipt
}

struct MockReceiptScanService: ReceiptScanService {
    let expiration: ExpirationService

    func parseReceipt(from pages: [UIImage]) async throws -> Receipt {
        // TODO(backend): upload pages to OCR/receipt-parsing API, map response to Receipt.
        try await Task.sleep(for: .seconds(1))
        let today = Date.now
        func line(_ name: String, _ category: FoodCategory, _ qty: Double, _ unit: String, _ price: Double) -> ReceiptLineItem {
            ReceiptLineItem(name: name, category: category, quantity: qty, unit: unit, price: price,
                            expiresOn: expiration.estimatedExpiry(for: category, purchasedOn: today))
        }
        return Receipt(storeName: "H-E-B", date: today, lineItems: [
            line("Bananas", .produce, 6, "ct", 1.74),
            line("Baby Spinach", .produce, 1, "bag", 3.49),
            line("Whole Milk", .dairy, 1, "gal", 3.98),
            line("Greek Yogurt", .dairy, 4, "cups", 4.50),
            line("Chicken Thighs", .meat, 2, "lb", 6.82),
            line("Sourdough Loaf", .bakery, 1, "loaf", 4.25),
        ])
    }
}
