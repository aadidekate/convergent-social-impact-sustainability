import Foundation

protocol CircleService {
    func fetchCircles() async -> [FoodCircle]
    func invite(email: String, to circleID: UUID) async throws
    func share(_ item: PantryItem, with circleID: UUID) async throws
}

struct MockCircleService: CircleService {
    func fetchCircles() async -> [FoodCircle] {
        // TODO(backend): load circles + membership for signed-in user.
        MockData.circles
    }

    func invite(email: String, to circleID: UUID) async throws {
        // TODO(backend): send circle invite.
        try await Task.sleep(for: .milliseconds(500))
    }

    func share(_ item: PantryItem, with circleID: UUID) async throws {
        // TODO(backend): publish shared item to circle members.
        try await Task.sleep(for: .milliseconds(300))
    }
}
