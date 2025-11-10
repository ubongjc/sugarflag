import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        NavigationStack {
            List {
                // User section
                Section {
                    if let user = authManager.currentUser {
                        HStack {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 50))
                                .foregroundStyle(.blue)

                            VStack(alignment: .leading, spacing: 4) {
                                Text(user.email)
                                    .font(.headline)

                                Text("Member since \(formatDate(user.createdAt))")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }

                // Preferences
                Section("Preferences") {
                    NavigationLink {
                        Text("Diet Preferences")
                    } label: {
                        Label("Diet Preferences", systemImage: "leaf")
                    }

                    NavigationLink {
                        Text("Budget Settings")
                    } label: {
                        Label("Budget", systemImage: "dollarsign.circle")
                    }

                    NavigationLink {
                        Text("Taste Profile")
                    } label: {
                        Label("Taste Profile", systemImage: "fork.knife")
                    }
                }

                // Privacy & Security
                Section("Privacy & Security") {
                    NavigationLink {
                        Text("Privacy Settings")
                    } label: {
                        Label("Privacy", systemImage: "lock.shield")
                    }

                    NavigationLink {
                        Text("Data Export")
                    } label: {
                        Label("Export Data", systemImage: "arrow.down.doc")
                    }

                    Button(role: .destructive) {
                        // Delete account
                    } label: {
                        Label("Delete Account", systemImage: "trash")
                    }
                }

                // Subscription
                Section("Subscription") {
                    NavigationLink {
                        Text("Manage Subscription")
                    } label: {
                        HStack {
                            Label("Premium", systemImage: "star.fill")

                            Spacer()

                            Text("$2.99/mo")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }

                // About
                Section("About") {
                    NavigationLink {
                        Text("Help & Support")
                    } label: {
                        Label("Help & Support", systemImage: "questionmark.circle")
                    }

                    NavigationLink {
                        Text("Terms of Service")
                    } label: {
                        Label("Terms of Service", systemImage: "doc.text")
                    }

                    NavigationLink {
                        Text("Privacy Policy")
                    } label: {
                        Label("Privacy Policy", systemImage: "hand.raised")
                    }

                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundStyle(.secondary)
                    }
                }

                // Sign Out
                Section {
                    Button(role: .destructive) {
                        authManager.signOut()
                    } label: {
                        HStack {
                            Spacer()
                            Label("Sign Out", systemImage: "arrow.right.square")
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Profile")
        }
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthManager())
}
