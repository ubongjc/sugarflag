import Foundation
import Combine

/// Manages all network requests to the SugarFlag API
@MainActor
class NetworkManager: ObservableObject {
    private let baseURL: URL
    private let session: URLSession

    init(baseURL: String = "https://api.sugarflag.app") {
        self.baseURL = URL(string: baseURL)!

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 300
        self.session = URLSession(configuration: config)
    }

    // MARK: - Auth Endpoints

    func requestAuthChallenge() async throws -> AuthChallenge {
        try await request(
            endpoint: "/api/auth/challenge",
            method: "GET"
        )
    }

    func requestRegistrationChallenge(email: String) async throws -> AuthChallenge {
        try await request(
            endpoint: "/api/auth/register/challenge",
            method: "POST",
            body: ["email": email]
        )
    }

    func completeSignIn(
        credentialID: String,
        authenticatorData: String,
        signature: String,
        userID: String
    ) async throws -> AuthResponse {
        try await request(
            endpoint: "/api/auth/signin",
            method: "POST",
            body: [
                "credentialID": credentialID,
                "authenticatorData": authenticatorData,
                "signature": signature,
                "userID": userID
            ]
        )
    }

    func completeRegistration(
        credentialID: String,
        attestationObject: String
    ) async throws -> AuthResponse {
        try await request(
            endpoint: "/api/auth/register",
            method: "POST",
            body: [
                "credentialID": credentialID,
                "attestationObject": attestationObject
            ]
        )
    }

    func validateSession(token: String) async throws -> User {
        try await request(
            endpoint: "/api/auth/validate",
            method: "GET",
            token: token
        )
    }

    // MARK: - Scan Endpoints

    func scanProduct(upc: String? = nil, photo: Data? = nil) async throws -> ScanResponse {
        var body: [String: Any] = [:]

        if let upc = upc {
            body["upc"] = upc
        }

        if let photo = photo {
            body["photo"] = photo.base64EncodedString()
        }

        return try await request(
            endpoint: "/api/scan",
            method: "POST",
            body: body,
            requiresAuth: true
        )
    }

    func getProduct(upc: String) async throws -> ProductResponse {
        try await request(
            endpoint: "/api/product/\(upc)",
            method: "GET"
        )
    }

    // MARK: - Cart Endpoints

    func getCartSuggestion() async throws -> CartSuggestionResponse {
        try await request(
            endpoint: "/api/cart/suggest",
            method: "GET",
            requiresAuth: true
        )
    }

    // MARK: - Generic Request Method

    private func request<T: Decodable>(
        endpoint: String,
        method: String,
        body: [String: Any]? = nil,
        token: String? = nil,
        requiresAuth: Bool = false
    ) async throws -> T {
        var request = URLRequest(url: baseURL.appendingPathComponent(endpoint))
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Add auth token if provided or required
        if let token = token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        } else if requiresAuth {
            // Get token from keychain
            let keychain = KeychainManager()
            if let storedToken = keychain.getAccessToken() {
                request.setValue("Bearer \(storedToken)", forHTTPHeaderField: "Authorization")
            }
        }

        // Add body if present
        if let body = body {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            // Try to decode error response
            if let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw NetworkError.apiError(errorResponse.message)
            }
            throw NetworkError.httpError(httpResponse.statusCode)
        }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        return try decoder.decode(T.self, from: data)
    }
}

// MARK: - Network Models

struct AuthChallenge: Codable {
    let challenge: String
    let timeout: Int?
}

struct AuthResponse: Codable {
    let accessToken: String
    let user: User
}

struct ScanResponse: Codable {
    let scanId: String
    let score: Int
    let sweeteners: [SweetenerInfo]
    let rationale: String
    let uncertainty: Double?
    let product: ProductInfo?
}

struct SweetenerInfo: Codable {
    let name: String
    let type: String
    let position: Int
    let healthScore: Int
}

struct ProductInfo: Codable {
    let upc: String
    let name: String
    let brand: String
    let totalSugars: Double?
    let addedSugars: Double?
    let servingSize: String?
}

struct ProductResponse: Codable {
    let id: String
    let upc: String
    let name: String
    let brand: String
    let description: String?
    let nutrients: Nutrients
    let ingredients: String?
    let sweeteners: [SweetenerInfo]
}

struct Nutrients: Codable {
    let servingSize: String?
    let calories: Double?
    let totalSugars: Double?
    let addedSugars: Double?
    let totalCarbs: Double?
    let protein: Double?
    let fat: Double?
    let sodium: Double?
    let fiber: Double?
}

struct CartSuggestionResponse: Codable {
    let id: String
    let weekOf: String
    let items: [CartItem]
    let estSavings: Double?
    let totalCost: Double?
    let generatedAt: String
}

struct CartItem: Codable {
    let productId: String
    let upc: String
    let name: String
    let brand: String
    let quantity: Int
    let price: Double?
    let reason: String
    let sugarSavings: Double?
}

struct ErrorResponse: Codable {
    let error: String
    let message: String
}

enum NetworkError: LocalizedError {
    case invalidResponse
    case httpError(Int)
    case apiError(String)
    case decodingError

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "Invalid response from server"
        case .httpError(let code):
            return "HTTP error: \(code)"
        case .apiError(let message):
            return message
        case .decodingError:
            return "Failed to decode response"
        }
    }
}
