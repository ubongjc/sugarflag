import SwiftUI

struct CartView: View {
    @EnvironmentObject var networkManager: NetworkManager

    @State private var cartSuggestion: CartSuggestionResponse?
    @State private var isLoading = true
    @State private var error: Error?

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    ProgressView("Loading suggestions...")
                } else if let error = error {
                    ErrorStateView(error: error) {
                        loadCartSuggestion()
                    }
                } else if let cart = cartSuggestion {
                    CartContentView(cart: cart)
                } else {
                    EmptyCartView()
                }
            }
            .navigationTitle("Weekly Cart")
            .task {
                loadCartSuggestion()
            }
        }
    }

    private func loadCartSuggestion() {
        isLoading = true
        error = nil

        Task {
            do {
                let suggestion = try await networkManager.getCartSuggestion()
                await MainActor.run {
                    cartSuggestion = suggestion
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.error = error
                    isLoading = false
                }
            }
        }
    }
}

struct CartContentView: View {
    let cart: CartSuggestionResponse

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Summary card
                VStack(spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Sugar Savings")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)

                            if let savings = cart.estSavings {
                                Text("\(savings, specifier: "%.0f")g")
                                    .font(.title)
                                    .fontWeight(.bold)
                                    .foregroundStyle(.green)
                            }
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Total Cost")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)

                            if let cost = cart.totalCost {
                                Text("$\(cost, specifier: "%.2f")")
                                    .font(.title)
                                    .fontWeight(.bold)
                            }
                        }
                    }

                    Divider()

                    HStack {
                        Image(systemName: "calendar")
                            .foregroundStyle(.secondary)

                        Text("Week of \(formatDate(cart.weekOf))")
                            .font(.caption)
                            .foregroundStyle(.secondary)

                        Spacer()

                        Text("\(cart.items.count) items")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // Items list
                VStack(spacing: 16) {
                    ForEach(cart.items, id: \.productId) { item in
                        CartItemCard(item: item)
                    }
                }
            }
            .padding()
        }
    }

    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .medium
            return displayFormatter.string(from: date)
        }
        return dateString
    }
}

struct CartItemCard: View {
    let item: CartItem

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.name)
                        .font(.headline)

                    Text(item.brand)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    if let savings = item.sugarSavings {
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.down.circle.fill")
                                .foregroundStyle(.green)
                                .font(.caption)

                            Text("\(savings, specifier: "%.0f")g sugar saved")
                                .font(.caption)
                                .foregroundStyle(.green)
                        }
                        .padding(.top, 4)
                    }
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    if let price = item.price {
                        Text("$\(price, specifier: "%.2f")")
                            .font(.headline)
                    }

                    Text("Qty: \(item.quantity)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Text(item.reason)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .padding(.top, 4)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
}

struct EmptyCartView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "cart")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)

            Text("No Suggestions Yet")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Start scanning products to get personalized lower-sugar alternatives")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
    }
}

struct ErrorStateView: View {
    let error: Error
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 60))
                .foregroundStyle(.orange)

            Text("Error Loading Cart")
                .font(.title2)
                .fontWeight(.semibold)

            Text(error.localizedDescription)
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)

            Button(action: retry) {
                Text("Try Again")
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.blue)
                    .foregroundStyle(.white)
                    .cornerRadius(8)
            }
        }
    }
}

#Preview {
    CartView()
        .environmentObject(NetworkManager())
}
