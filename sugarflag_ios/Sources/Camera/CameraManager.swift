import AVFoundation
import UIKit
import Vision
import Combine

/// Manages camera capture and OCR processing
@MainActor
class CameraManager: NSObject, ObservableObject {
    @Published var capturedImage: UIImage?
    @Published var recognizedText: String?
    @Published var isProcessing = false
    @Published var error: CameraError?

    private var captureSession: AVCaptureSession?
    private var photoOutput: AVCapturePhotoOutput?
    private var videoPreviewLayer: AVCaptureVideoPreviewLayer?

    // MARK: - Camera Setup

    func setupCamera() async throws {
        // Request camera permission
        let status = AVCaptureDevice.authorizationStatus(for: .video)

        switch status {
        case .authorized:
            break
        case .notDetermined:
            let granted = await AVCaptureDevice.requestAccess(for: .video)
            if !granted {
                throw CameraError.permissionDenied
            }
        case .denied, .restricted:
            throw CameraError.permissionDenied
        @unknown default:
            throw CameraError.permissionDenied
        }

        // Setup capture session
        let session = AVCaptureSession()
        session.sessionPreset = .photo

        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back) else {
            throw CameraError.cameraNotAvailable
        }

        let input = try AVCaptureDeviceInput(device: camera)
        guard session.canAddInput(input) else {
            throw CameraError.configurationFailed
        }
        session.addInput(input)

        let output = AVCapturePhotoOutput()
        guard session.canAddOutput(output) else {
            throw CameraError.configurationFailed
        }
        session.addOutput(output)

        self.captureSession = session
        self.photoOutput = output

        // Start session on background thread
        Task.detached {
            session.startRunning()
        }
    }

    func stopCamera() {
        captureSession?.stopRunning()
    }

    func getPreviewLayer() -> AVCaptureVideoPreviewLayer? {
        guard let session = captureSession else { return nil }

        let previewLayer = AVCaptureVideoPreviewLayer(session: session)
        previewLayer.videoGravity = .resizeAspectFill
        return previewLayer
    }

    // MARK: - Photo Capture

    func capturePhoto() {
        guard let photoOutput = photoOutput else { return }

        let settings = AVCapturePhotoSettings()
        photoOutput.capturePhoto(with: settings, delegate: self)
    }

    // MARK: - OCR Processing

    func performOCR(on image: UIImage) async throws -> String {
        isProcessing = true
        defer { isProcessing = false }

        guard let cgImage = image.cgImage else {
            throw CameraError.ocrFailed
        }

        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true

        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])

        try handler.perform([request])

        guard let observations = request.results else {
            throw CameraError.ocrFailed
        }

        let recognizedStrings = observations.compactMap { observation in
            observation.topCandidates(1).first?.string
        }

        return recognizedStrings.joined(separator: "\n")
    }

    /// Detect and extract UPC/barcode from image
    func detectBarcode(in image: UIImage) async throws -> String? {
        guard let cgImage = image.cgImage else {
            throw CameraError.barcodeDetectionFailed
        }

        let request = VNDetectBarcodesRequest()

        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        try handler.perform([request])

        guard let results = request.results, !results.isEmpty else {
            return nil
        }

        // Return the first detected barcode
        return results.first?.payloadStringValue
    }
}

// MARK: - AVCapturePhotoCaptureDelegate
extension CameraManager: AVCapturePhotoCaptureDelegate {
    nonisolated func photoOutput(
        _ output: AVCapturePhotoOutput,
        didFinishProcessingPhoto photo: AVCapturePhoto,
        error: Error?
    ) {
        if let error = error {
            Task { @MainActor in
                self.error = .captureFailed(error.localizedDescription)
            }
            return
        }

        guard let imageData = photo.fileDataRepresentation(),
              let image = UIImage(data: imageData) else {
            Task { @MainActor in
                self.error = .captureFailed("Failed to process photo data")
            }
            return
        }

        Task { @MainActor in
            self.capturedImage = image
        }
    }
}

// MARK: - Supporting Types

enum CameraError: LocalizedError {
    case permissionDenied
    case cameraNotAvailable
    case configurationFailed
    case captureFailed(String)
    case ocrFailed
    case barcodeDetectionFailed

    var errorDescription: String? {
        switch self {
        case .permissionDenied:
            return "Camera permission denied"
        case .cameraNotAvailable:
            return "Camera not available"
        case .configurationFailed:
            return "Failed to configure camera"
        case .captureFailed(let message):
            return "Capture failed: \(message)"
        case .ocrFailed:
            return "Text recognition failed"
        case .barcodeDetectionFailed:
            return "Barcode detection failed"
        }
    }
}
