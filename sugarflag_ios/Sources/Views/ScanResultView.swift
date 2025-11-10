import SwiftUI

struct ScanResultView: View {
    let scanResult: ScanResponse

    @Environment(\.dismiss) var dismiss

    var scoreColor: Color {
        if scanResult.score >= 80 {
            return .green
        } else if scanResult.score >= 60 {
            return .yellow
        } else if scanResult.score >= 40 {
            return .orange
        } else {
            return .red
        }
    }

    var scoreLabel: String {
        if scanResult.score >= 80 {
            return "Excellent"
        } else if scanResult.score >= 60 {
            return "Good"
        } else if scanResult.score >= 40 {
            return "Fair"
        } else if scanResult.score >= 20 {
            return "Poor"
        } else {
            return "Very Poor"
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Score circle
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(scoreColor.opacity(0.2))
                                .frame(width: 140, height: 140)

                            VStack(spacing: 4) {
                                Text("\(scanResult.score)")
                                    .font(.system(size: 48, weight: .bold))
                                    .foregroundStyle(scoreColor)

                                Text(scoreLabel)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        if let product = scanResult.product {
                            VStack(spacing: 4) {
                                Text(product.name)
                                    .font(.title3)
                                    .fontWeight(.semibold)
                                    .multilineTextAlignment(.center)

                                Text(product.brand)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding(.top)

                    // Rationale
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Analysis", systemImage: "doc.text")
                            .font(.headline)

                        Text(scanResult.rationale)
                            .font(.body)
                            .foregroundStyle(.primary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                    // Sweeteners detected
                    if !scanResult.sweeteners.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Label("Sweeteners Detected", systemImage: "list.bullet")
                                .font(.headline)

                            ForEach(scanResult.sweeteners, id: \.name) { sweetener in
                                HStack(spacing: 12) {
                                    // Type icon
                                    Image(systemName: iconForSweetenerType(sweetener.type))
                                        .foregroundStyle(colorForSweetenerType(sweetener.type))
                                        .frame(width: 30)

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(sweetener.name)
                                            .font(.body)
                                            .fontWeight(.medium)

                                        Text("Position: #\(sweetener.position) • Health Score: \(sweetener.healthScore)/100")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }

                                    Spacer()
                                }
                                .padding(.vertical, 8)
                                .padding(.horizontal, 12)
                                .background(Color(.systemBackground))
                                .cornerRadius(8)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }

                    // Product details
                    if let product = scanResult.product {
                        VStack(alignment: .leading, spacing: 12) {
                            Label("Nutrition Facts", systemImage: "chart.bar")
                                .font(.headline)

                            VStack(spacing: 8) {
                                if let servingSize = product.servingSize {
                                    NutrientRow(label: "Serving Size", value: servingSize)
                                }

                                if let totalSugars = product.totalSugars {
                                    NutrientRow(label: "Total Sugars", value: "\(totalSugars, specifier: "%.1f")g")
                                }

                                if let addedSugars = product.addedSugars {
                                    NutrientRow(label: "Added Sugars", value: "\(addedSugars, specifier: "%.1f")g")
                                        .fontWeight(.semibold)
                                }
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }

                    // Uncertainty indicator
                    if let uncertainty = scanResult.uncertainty, uncertainty > 0.3 {
                        HStack(spacing: 8) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundStyle(.orange)

                            Text("Some data may be incomplete or estimated")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
                .padding()
            }
            .navigationTitle("Scan Result")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }

    private func iconForSweetenerType(_ type: String) -> String {
        switch type {
        case "added_sugar":
            return "cube.fill"
        case "artificial":
            return "flask.fill"
        case "natural_alternative":
            return "leaf.fill"
        default:
            return "questionmark.circle"
        }
    }

    private func colorForSweetenerType(_ type: String) -> Color {
        switch type {
        case "added_sugar":
            return .red
        case "artificial":
            return .orange
        case "natural_alternative":
            return .green
        default:
            return .gray
        }
    }
}

struct NutrientRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
        .font(.body)
    }
}

#Preview {
    ScanResultView(scanResult: ScanResponse(
        scanId: "test",
        score: 75,
        sweeteners: [
            SweetenerInfo(name: "Cane Sugar", type: "added_sugar", position: 3, healthScore: 40),
            SweetenerInfo(name: "Stevia", type: "natural_alternative", position: 5, healthScore: 85)
        ],
        rationale: "Moderate added sugars (8g per serving). Uses some natural sweeteners.",
        uncertainty: 0.2,
        product: ProductInfo(
            upc: "012345678901",
            name: "Sample Yogurt",
            brand: "Healthy Brand",
            totalSugars: 12,
            addedSugars: 8,
            servingSize: "1 cup (227g)"
        )
    ))
}
