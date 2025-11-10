import SwiftUI
import AVFoundation

struct ScanView: View {
    @StateObject private var cameraManager = CameraManager()
    @StateObject private var cryptoManager = CryptoManager()
    @EnvironmentObject var networkManager: NetworkManager

    @State private var showingScanner = false
    @State private var showingResult = false
    @State private var scanResult: ScanResponse?
    @State private var isProcessing = false
    @State private var encryptScans = true
    @State private var showingError = false
    @State private var errorMessage = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Text("🍭")
                        .font(.system(size: 60))

                    Text("Scan a Product")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Point your camera at a nutrition label or barcode")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)

                Spacer()

                // Scan buttons
                VStack(spacing: 16) {
                    Button(action: {
                        showingScanner = true
                    }) {
                        Label("Scan Nutrition Label", systemImage: "doc.text.viewfinder")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundStyle(.white)
                            .cornerRadius(12)
                    }

                    Button(action: {
                        // TODO: Show barcode scanner
                    }) {
                        Label("Scan Barcode", systemImage: "barcode.viewfinder")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundStyle(.white)
                            .cornerRadius(12)
                    }
                }
                .padding(.horizontal, 32)

                Spacer()

                // Encryption toggle
                Toggle(isOn: $encryptScans) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Secure Scans")
                            .font(.headline)
                        Text("Encrypt photos on-device before upload")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal, 32)
                .padding(.bottom, 32)
            }
            .navigationTitle("Scan")
            .sheet(isPresented: $showingScanner) {
                CameraCaptureView(cameraManager: cameraManager) { image in
                    showingScanner = false
                    processScan(image: image)
                }
            }
            .sheet(isPresented: $showingResult) {
                if let result = scanResult {
                    ScanResultView(scanResult: result)
                }
            }
            .alert("Error", isPresented: $showingError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(errorMessage)
            }
            .overlay {
                if isProcessing {
                    Color.black.opacity(0.4)
                        .ignoresSafeArea()
                    ProgressView("Processing scan...")
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                }
            }
        }
    }

    private func processScan(image: UIImage) {
        isProcessing = true

        Task {
            do {
                // Get image data
                guard let imageData = image.jpegData(compressionQuality: 0.8) else {
                    throw NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to process image"])
                }

                // Encrypt if enabled
                let dataToSend: Data
                if encryptScans {
                    let encrypted = try cryptoManager.encryptImage(imageData)
                    // For now, we'll send the encrypted base64 string
                    // In production, this would be handled differently
                    dataToSend = imageData
                } else {
                    dataToSend = imageData
                }

                // Send to API
                let result = try await networkManager.scanProduct(photo: dataToSend)

                await MainActor.run {
                    scanResult = result
                    showingResult = true
                    isProcessing = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    showingError = true
                    isProcessing = false
                }
            }
        }
    }
}

#Preview {
    ScanView()
        .environmentObject(NetworkManager())
}
