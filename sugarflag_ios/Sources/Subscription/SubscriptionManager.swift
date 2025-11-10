import Foundation
import StoreKit

/// Manages in-app subscriptions using StoreKit 2
@MainActor
public class SubscriptionManager: ObservableObject {
    public static let shared = SubscriptionManager()

    @Published public var products: [Product] = []
    @Published public var purchasedProductIDs: Set<String> = []
    @Published public var isLoading = false

    // Product IDs
    private let productIDs: Set<String> = [
        "com.sugarflag.premium.monthly",
        "com.sugarflag.family.monthly"
    ]

    private var updateListenerTask: Task<Void, Error>?

    private init() {
        // Start listening for transaction updates
        updateListenerTask = listenForTransactions()

        Task {
            await loadProducts()
            await updatePurchasedProducts()
        }
    }

    deinit {
        updateListenerTask?.cancel()
    }

    /// Load available products from App Store
    public func loadProducts() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let storeProducts = try await Product.products(for: productIDs)
            products = storeProducts.sorted { $0.price < $1.price }
        } catch {
            print("Failed to load products: \(error)")
        }
    }

    /// Purchase a product
    public func purchase(_ product: Product) async throws -> Transaction? {
        let result = try await product.purchase()

        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await updatePurchasedProducts()
            await transaction.finish()
            return transaction

        case .userCancelled, .pending:
            return nil

        @unknown default:
            return nil
        }
    }

    /// Restore purchases
    public func restorePurchases() async throws {
        try await AppStore.sync()
        await updatePurchasedProducts()
    }

    /// Check if user has premium access
    public var hasPremiumAccess: Bool {
        !purchasedProductIDs.isEmpty
    }

    /// Get current subscription tier
    public var currentTier: SubscriptionTier {
        if purchasedProductIDs.contains("com.sugarflag.family.monthly") {
            return .family
        } else if purchasedProductIDs.contains("com.sugarflag.premium.monthly") {
            return .premium
        } else {
            return .free
        }
    }

    // MARK: - Private Methods

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw StoreError.failedVerification
        case .verified(let safe):
            return safe
        }
    }

    private func updatePurchasedProducts() async {
        var purchasedIDs: Set<String> = []

        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else {
                continue
            }

            if transaction.revocationDate == nil {
                purchasedIDs.insert(transaction.productID)
            }
        }

        purchasedProductIDs = purchasedIDs
    }

    private func listenForTransactions() -> Task<Void, Error> {
        return Task.detached {
            for await result in Transaction.updates {
                guard case .verified(let transaction) = result else {
                    continue
                }

                await self.updatePurchasedProducts()
                await transaction.finish()
            }
        }
    }
}

// MARK: - Supporting Types

public enum SubscriptionTier: String {
    case free = "Free"
    case premium = "Premium"
    case family = "Family"

    public var displayName: String { rawValue }

    public var features: [String] {
        switch self {
        case .free:
            return [
                "10 scans per month",
                "Basic product scores",
                "Scan history"
            ]
        case .premium:
            return [
                "Unlimited scans",
                "Advanced recommendations",
                "Weekly cart suggestions",
                "Data export",
                "Priority support"
            ]
        case .family:
            return [
                "Up to 5 users",
                "All Premium features",
                "Shared scan history",
                "Priority support"
            ]
        }
    }
}

public enum StoreError: Error {
    case failedVerification
}
