import SwiftUI
import StoreKit

public struct SubscriptionView: View {
    @StateObject private var subscriptionManager = SubscriptionManager.shared
    @Environment(\.dismiss) private var dismiss

    @State private var selectedProduct: Product?
    @State private var isPurchasing = false
    @State private var showError = false
    @State private var errorMessage = ""

    public init() {}

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    headerSection

                    // Current Plan (if subscribed)
                    if subscriptionManager.hasPremiumAccess {
                        currentPlanSection
                    }

                    // Subscription Plans
                    plansSection

                    // Features Comparison
                    featuresSection

                    // Restore Purchases
                    restoreButton

                    // Fine Print
                    finePrintSection
                }
                .padding()
            }
            .navigationTitle("Subscription")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK") { }
            } message: {
                Text(errorMessage)
            }
            .overlay {
                if subscriptionManager.isLoading || isPurchasing {
                    ProgressView()
                        .scaleEffect(1.5)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black.opacity(0.2))
                }
            }
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(spacing: 12) {
            Text("🍭")
                .font(.system(size: 60))

            Text("Upgrade to Premium")
                .font(.title.bold())

            Text("Get unlimited scans and personalized recommendations")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, 20)
    }

    // MARK: - Current Plan

    private var currentPlanSection: some View {
        VStack(spacing: 8) {
            HStack {
                Text("Current Plan")
                    .font(.headline)
                Spacer()
                Text(subscriptionManager.currentTier.displayName)
                    .font(.subheadline)
                    .foregroundColor(.green)
            }

            Divider()
        }
        .padding()
        .background(Color(uiColor: .secondarySystemBackground))
        .cornerRadius(12)
    }

    // MARK: - Plans

    private var plansSection: some View {
        VStack(spacing: 16) {
            ForEach(subscriptionManager.products, id: \.id) { product in
                planCard(for: product)
            }

            if subscriptionManager.products.isEmpty && !subscriptionManager.isLoading {
                Text("Unable to load subscription plans")
                    .foregroundColor(.secondary)
                    .padding()
            }
        }
    }

    private func planCard(for product: Product) -> some View {
        let isFamilyPlan = product.id == "com.sugarflag.family.monthly"
        let isPremiumPlan = product.id == "com.sugarflag.premium.monthly"
        let isCurrentPlan = subscriptionManager.purchasedProductIDs.contains(product.id)

        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(isFamilyPlan ? "Family" : "Premium")
                        .font(.title2.bold())

                    Text(product.displayPrice + "/month")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if isFamilyPlan {
                    Text("BEST VALUE")
                        .font(.caption.bold())
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(4)
                }
            }

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                if isFamilyPlan {
                    featureRow("Up to 5 users", systemImage: "person.3.fill")
                    featureRow("All Premium features", systemImage: "star.fill")
                    featureRow("Shared scan history", systemImage: "clock.arrow.circlepath")
                    featureRow("Priority support", systemImage: "headphones")
                } else {
                    featureRow("Unlimited scans", systemImage: "infinity")
                    featureRow("Advanced recommendations", systemImage: "sparkles")
                    featureRow("Weekly cart suggestions", systemImage: "cart.fill")
                    featureRow("Data export", systemImage: "square.and.arrow.up")
                }
            }

            if isCurrentPlan {
                Text("Current Plan")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green.opacity(0.2))
                    .foregroundColor(.green)
                    .cornerRadius(8)
                    .font(.headline)
            } else {
                Button {
                    selectedProduct = product
                    Task {
                        await purchaseProduct(product)
                    }
                } label: {
                    Text("Subscribe")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.accentColor)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                        .font(.headline)
                }
                .disabled(isPurchasing || subscriptionManager.isLoading)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(uiColor: .secondarySystemBackground))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(isFamilyPlan ? Color.green : Color.clear, lineWidth: 2)
                )
        )
    }

    private func featureRow(_ text: String, systemImage: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: systemImage)
                .foregroundColor(.accentColor)
                .frame(width: 20)
            Text(text)
                .font(.subheadline)
        }
    }

    // MARK: - Features Comparison

    private var featuresSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("All Plans Include")
                .font(.headline)

            VStack(alignment: .leading, spacing: 8) {
                featureRow("Barcode scanning", systemImage: "barcode.viewfinder")
                featureRow("Photo scanning with AI", systemImage: "camera.fill")
                featureRow("Sugar scores (0-100)", systemImage: "chart.bar.fill")
                featureRow("Sweetener breakdown", systemImage: "list.bullet")
                featureRow("Privacy-first encryption", systemImage: "lock.shield.fill")
            }
        }
        .padding()
        .background(Color(uiColor: .secondarySystemBackground))
        .cornerRadius(12)
    }

    // MARK: - Restore Button

    private var restoreButton: some View {
        Button {
            Task {
                await restorePurchases()
            }
        } label: {
            Text("Restore Purchases")
                .font(.subheadline)
                .foregroundColor(.accentColor)
        }
        .disabled(isPurchasing || subscriptionManager.isLoading)
    }

    // MARK: - Fine Print

    private var finePrintSection: some View {
        VStack(spacing: 8) {
            Text("• Subscriptions auto-renew unless cancelled")
            Text("• Cancel anytime from Settings")
            Text("• Payment charged to App Store account")
            Text("• See Terms of Service and Privacy Policy")
        }
        .font(.caption)
        .foregroundColor(.secondary)
        .multilineTextAlignment(.center)
        .padding(.bottom, 20)
    }

    // MARK: - Actions

    private func purchaseProduct(_ product: Product) async {
        isPurchasing = true
        defer { isPurchasing = false }

        do {
            let transaction = try await subscriptionManager.purchase(product)
            if transaction != nil {
                // Purchase successful
                dismiss()
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    private func restorePurchases() async {
        isPurchasing = true
        defer { isPurchasing = false }

        do {
            try await subscriptionManager.restorePurchases()
        } catch {
            errorMessage = "Failed to restore purchases: \(error.localizedDescription)"
            showError = true
        }
    }
}

#Preview {
    SubscriptionView()
}
