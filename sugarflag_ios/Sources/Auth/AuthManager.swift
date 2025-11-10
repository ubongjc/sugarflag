import Foundation
import AuthenticationServices
import Combine

/// Manages user authentication using WebAuthn/Passkeys
@MainActor
class AuthManager: NSObject, ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var authError: AuthError?

    private let networkManager: NetworkManager
    private let keychainManager = KeychainManager()

    override init() {
        self.networkManager = NetworkManager()
        super.init()
        checkAuthStatus()
    }

    /// Check if user has a valid session
    func checkAuthStatus() {
        if let token = keychainManager.getAccessToken() {
            // Validate token with backend
            Task {
                do {
                    let user = try await networkManager.validateSession(token: token)
                    self.currentUser = user
                    self.isAuthenticated = true
                } catch {
                    // Token expired or invalid
                    self.isAuthenticated = false
                    keychainManager.deleteAccessToken()
                }
            }
        }
    }

    /// Sign in with Passkey (WebAuthn)
    func signInWithPasskey(anchor: ASPresentationAnchor) async throws {
        // 1. Request challenge from server
        let challenge = try await networkManager.requestAuthChallenge()

        // 2. Create assertion request
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(
            relyingPartyIdentifier: "sugarflag.app"
        )

        let assertionRequest = provider.createCredentialAssertionRequest(
            challenge: Data(base64Encoded: challenge.challenge)!
        )

        // 3. Perform authorization
        let authController = ASAuthorizationController(authorizationRequests: [assertionRequest])
        authController.delegate = self
        authController.presentationContextProvider = self

        // This will trigger the delegate methods
        authController.performRequests()
    }

    /// Register new passkey
    func registerPasskey(email: String, anchor: ASPresentationAnchor) async throws {
        // 1. Request registration challenge
        let challenge = try await networkManager.requestRegistrationChallenge(email: email)

        // 2. Create credential registration request
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(
            relyingPartyIdentifier: "sugarflag.app"
        )

        let registrationRequest = provider.createCredentialRegistrationRequest(
            challenge: Data(base64Encoded: challenge.challenge)!,
            name: email,
            userID: Data(email.utf8)
        )

        // 3. Perform authorization
        let authController = ASAuthorizationController(authorizationRequests: [registrationRequest])
        authController.delegate = self
        authController.presentationContextProvider = self

        authController.performRequests()
    }

    /// Sign out
    func signOut() {
        keychainManager.deleteAccessToken()
        currentUser = nil
        isAuthenticated = false
    }
}

// MARK: - ASAuthorizationControllerDelegate
extension AuthManager: ASAuthorizationControllerDelegate {
    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        Task {
            do {
                if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion {
                    // Sign in flow
                    let response = try await networkManager.completeSignIn(
                        credentialID: credential.credentialID.base64EncodedString(),
                        authenticatorData: credential.rawAuthenticatorData.base64EncodedString(),
                        signature: credential.signature.base64EncodedString(),
                        userID: credential.userID.base64EncodedString()
                    )

                    keychainManager.saveAccessToken(response.accessToken)
                    currentUser = response.user
                    isAuthenticated = true

                } else if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialRegistration {
                    // Registration flow
                    let response = try await networkManager.completeRegistration(
                        credentialID: credential.credentialID.base64EncodedString(),
                        attestationObject: credential.rawAttestationObject?.base64EncodedString() ?? ""
                    )

                    keychainManager.saveAccessToken(response.accessToken)
                    currentUser = response.user
                    isAuthenticated = true
                }
            } catch {
                authError = .authenticationFailed(error.localizedDescription)
            }
        }
    }

    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        let authError = error as? ASAuthorizationError
        if authError?.code != .canceled {
            self.authError = .authenticationFailed(error.localizedDescription)
        }
    }
}

// MARK: - ASAuthorizationControllerPresentationContextProviding
extension AuthManager: ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        // Return the key window
        return UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow } ?? UIWindow()
    }
}

// MARK: - Supporting Types
enum AuthError: LocalizedError {
    case authenticationFailed(String)
    case networkError
    case invalidCredential

    var errorDescription: String? {
        switch self {
        case .authenticationFailed(let message):
            return "Authentication failed: \(message)"
        case .networkError:
            return "Network error occurred"
        case .invalidCredential:
            return "Invalid credential"
        }
    }
}

struct User: Codable {
    let id: String
    let email: String
    let createdAt: Date
}
