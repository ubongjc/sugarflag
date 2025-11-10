import SwiftUI

@main
struct SugarFlagApp: App {
    @StateObject private var authManager = AuthManager.shared
    @StateObject private var subscriptionManager = SubscriptionManager.shared

    var body: some Scene {
        WindowGroup {
            if authManager.isAuthenticated {
                MainTabView()
                    .environmentObject(authManager)
                    .environmentObject(subscriptionManager)
            } else {
                AuthView()
                    .environmentObject(authManager)
            }
        }
    }
}
