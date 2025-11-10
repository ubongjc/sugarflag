import SwiftUI
import AuthenticationServices

struct SignInView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var showingError = false

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Logo and branding
            VStack(spacing: 12) {
                Text("🍭")
                    .font(.system(size: 80))

                Text("SugarFlag")
                    .font(.system(size: 40, weight: .bold))

                Text("Know your sugar, choose better")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(spacing: 16) {
                // Passkey sign in button
                Button(action: {
                    Task {
                        do {
                            try await authManager.signInWithPasskey(
                                anchor: UIApplication.shared.connectedScenes
                                    .compactMap { $0 as? UIWindowScene }
                                    .flatMap { $0.windows }
                                    .first { $0.isKeyWindow } ?? UIWindow()
                            )
                        } catch {
                            showingError = true
                        }
                    }
                }) {
                    Label("Sign in with Passkey", systemImage: "person.badge.key.fill")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundStyle(.white)
                        .cornerRadius(12)
                }

                // Divider
                HStack {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(height: 1)
                    Text("or")
                        .foregroundStyle(.secondary)
                        .padding(.horizontal, 8)
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(height: 1)
                }
                .padding(.vertical, 8)

                // Email input for registration
                TextField("Email", text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                // Register button
                Button(action: {
                    Task {
                        do {
                            try await authManager.registerPasskey(
                                email: email,
                                anchor: UIApplication.shared.connectedScenes
                                    .compactMap { $0 as? UIWindowScene }
                                    .flatMap { $0.windows }
                                    .first { $0.isKeyWindow } ?? UIWindow()
                            )
                        } catch {
                            showingError = true
                        }
                    }
                }) {
                    Text("Create Account")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .foregroundStyle(.white)
                        .cornerRadius(12)
                }
                .disabled(email.isEmpty)
            }
            .padding(.horizontal, 32)

            Spacer()

            // Privacy note
            Text("We prioritize your privacy. All scans can be encrypted on-device.")
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
                .padding(.bottom, 32)
        }
        .alert("Authentication Error", isPresented: $showingError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(authManager.authError?.localizedDescription ?? "An error occurred")
        }
    }
}

#Preview {
    SignInView()
        .environmentObject(AuthManager())
}
