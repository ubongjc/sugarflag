import SwiftUI

@main
struct SugarFlagApp: App {
    @StateObject private var authManager = AuthManager()
    @StateObject private var networkManager = NetworkManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(networkManager)
        }
    }
}
