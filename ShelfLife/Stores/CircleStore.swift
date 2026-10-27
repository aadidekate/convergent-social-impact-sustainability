import Foundation
import Observation

@MainActor @Observable
final class CircleStore {
    private(set) var circles: [FoodCircle] = []
    private let services: Services

    init(services: Services) {
        self.services = services
    }

    func load() async {
        circles = await services.circles.fetchCircles()
    }

    func createCircle(named name: String, owner: CircleMember) {
        // TODO(backend): create circle server-side.
        circles.append(FoodCircle(name: name, members: [owner], sharedItems: []))
    }

    func invite(email: String, to circleID: UUID) async throws {
        try await services.circles.invite(email: email, to: circleID)
    }

    func share(_ item: PantryItem, with circleID: UUID) async throws {
        try await services.circles.share(item, with: circleID)
        guard let index = circles.firstIndex(where: { $0.id == circleID }) else { return }
        var shared = item
        shared.sharedCircleID = circleID
        circles[index].sharedItems.append(shared)
    }
}
