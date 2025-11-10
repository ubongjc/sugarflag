import SwiftUI
import AVFoundation

struct CameraCaptureView: View {
    @ObservedObject var cameraManager: CameraManager
    let onCapture: (UIImage) -> Void

    @Environment(\.dismiss) var dismiss

    var body: some View {
        ZStack {
            CameraPreview(cameraManager: cameraManager)
                .ignoresSafeArea()

            VStack {
                // Top bar
                HStack {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.title2)
                            .foregroundStyle(.white)
                            .padding()
                            .background(Color.black.opacity(0.5))
                            .clipShape(Circle())
                    }
                    Spacer()
                }
                .padding()

                Spacer()

                // Capture button
                Button(action: {
                    cameraManager.capturePhoto()
                }) {
                    Circle()
                        .fill(Color.white)
                        .frame(width: 70, height: 70)
                        .overlay(
                            Circle()
                                .stroke(Color.white, lineWidth: 3)
                                .frame(width: 80, height: 80)
                        )
                }
                .padding(.bottom, 40)
            }
        }
        .task {
            do {
                try await cameraManager.setupCamera()
            } catch {
                print("Camera setup failed: \(error)")
                dismiss()
            }
        }
        .onDisappear {
            cameraManager.stopCamera()
        }
        .onChange(of: cameraManager.capturedImage) { oldValue, newValue in
            if let image = newValue {
                onCapture(image)
            }
        }
    }
}

/// UIViewRepresentable wrapper for camera preview
struct CameraPreview: UIViewRepresentable {
    let cameraManager: CameraManager

    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        view.backgroundColor = .black
        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        if let previewLayer = cameraManager.getPreviewLayer() {
            previewLayer.frame = uiView.bounds
            if uiView.layer.sublayers?.first != previewLayer {
                uiView.layer.addSublayer(previewLayer)
            }
        }
    }
}
