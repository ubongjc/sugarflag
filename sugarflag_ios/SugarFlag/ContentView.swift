import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            ScanView()
                .tabItem {
                    Label("Scan", systemImage: "barcode.viewfinder")
                }
                .tag(0)

            HistoryView()
                .tabItem {
                    Label("History", systemImage: "clock")
                }
                .tag(1)

            CartView()
                .tabItem {
                    Label("Cart", systemImage: "cart")
                }
                .tag(2)

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
                .tag(3)
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthManager())
}
