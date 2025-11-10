# SugarFlag iOS

Native iOS app for instant sugar and sweetener analysis using camera scanning.

## Features

- **Camera Scanning**: Capture nutrition labels with built-in camera
- **Barcode Detection**: Automatic UPC barcode recognition
- **Vision OCR**: On-device text recognition using Apple Vision framework
- **Passkey Authentication**: Secure, passwordless sign-in with Face ID/Touch ID
- **Client-Side Encryption**: Optional AES-GCM encryption for scan photos using CryptoKit
- **Weekly Cart**: Personalized lower-sugar product recommendations
- **Real-time Results**: Instant sugar scores with detailed breakdowns

## Tech Stack

- **Language**: Swift 5.9+
- **UI Framework**: SwiftUI
- **Async**: Combine + async/await
- **Camera**: AVFoundation
- **OCR**: Vision Framework
- **Encryption**: CryptoKit (AES-GCM-256)
- **Auth**: AuthenticationServices (WebAuthn/Passkeys)
- **Storage**: Keychain Services
- **Minimum iOS**: 16.0+

## Getting Started

### Prerequisites

- Xcode 15+
- iOS 16.0+ device or simulator
- Apple Developer account (for device testing)

### Installation

1. Navigate to the iOS folder:

```bash
cd sugarflag_ios
```

2. Open in Xcode:

```bash
open SugarFlag.xcodeproj
# or if using Swift Package:
open Package.swift
```

3. Configure API endpoint:

In `Sources/Networking/NetworkManager.swift`, update the base URL:

```swift
init(baseURL: String = "https://your-api.sugarflag.app")
```

4. Build and run:
- Select your target device
- Press ⌘R to build and run

## Project Structure

```
sugarflag_ios/
├── Sources/
│   ├── SugarFlagApp.swift       # App entry point
│   ├── ContentView.swift        # Main navigation
│   ├── Auth/
│   │   ├── AuthManager.swift    # Passkey authentication
│   │   └── KeychainManager.swift # Secure storage
│   ├── Camera/
│   │   └── CameraManager.swift  # AVFoundation + Vision OCR
│   ├── Crypto/
│   │   └── CryptoManager.swift  # Client-side encryption
│   ├── Networking/
│   │   └── NetworkManager.swift # API client
│   └── Views/
│       ├── SignInView.swift     # Authentication UI
│       ├── ScanView.swift       # Camera scanning
│       ├── ScanResultView.swift # Scan results
│       ├── CartView.swift       # Weekly cart
│       └── ProfileView.swift    # User profile
└── Tests/                       # Unit tests
```

## Architecture

### Modules

**Auth Module**
- WebAuthn/Passkey authentication
- Keychain-based token storage
- Session management

**Camera Module**
- AVCaptureSession configuration
- Photo capture with AVCapturePhotoOutput
- Vision framework OCR
- Barcode detection (VNDetectBarcodesRequest)

**Crypto Module**
- AES-GCM-256 encryption/decryption
- Secure key generation and storage
- Optional photo encryption before upload

**Networking Module**
- URLSession-based API client
- Codable request/response models
- Bearer token authentication
- Error handling

## API Integration

The iOS app communicates with the SugarFlag web API:

```swift
// Scan a product
let result = try await networkManager.scanProduct(upc: "012345678901")

// Get cart suggestions
let cart = try await networkManager.getCartSuggestion()

// Authenticate with passkey
try await authManager.signInWithPasskey(anchor: window)
```

## Privacy & Security

### On-Device Processing
- Vision OCR runs entirely on-device
- No photo uploads without explicit user consent
- Barcode detection happens locally

### Encryption
- Optional AES-GCM client-side encryption
- Encryption keys stored in Keychain
- Server only sees ciphertext when enabled

### Authentication
- Passkeys stored in iCloud Keychain
- Biometric authentication required
- No passwords stored

### Permissions
- Camera: Required for scanning
- Face ID/Touch ID: Required for passkeys
- Keychain: Used for tokens and encryption keys

## Configuration

### Info.plist Additions

Add these keys to your Info.plist:

```xml
<key>NSCameraUsageDescription</key>
<string>SugarFlag needs camera access to scan nutrition labels</string>

<key>NSFaceIDUsageDescription</key>
<string>Sign in securely with Face ID</string>
```

### Capabilities

Enable in Xcode:
- Keychain Sharing
- Associated Domains (for WebAuthn)

## Testing

Run tests with:

```bash
swift test
# or in Xcode: ⌘U
```

## Building for Release

1. Update version and build number in Xcode
2. Archive the app (⌘⇧B)
3. Upload to App Store Connect
4. Configure StoreKit for in-app purchases ($2.99/mo premium)

## Troubleshooting

**Camera not working:**
- Check Info.plist for NSCameraUsageDescription
- Verify camera permissions in Settings

**Passkey authentication fails:**
- Ensure associated domains are configured
- Check network connectivity
- Verify API endpoint supports WebAuthn

**OCR not recognizing text:**
- Ensure good lighting
- Hold camera steady
- Try portrait orientation
- Check Vision framework availability

## Roadmap

- [ ] Barcode scanner UI
- [ ] Offline mode with local cache
- [ ] Share scan results
- [ ] Dark mode support
- [ ] iPad optimization
- [ ] Widget for quick scanning
- [ ] Apple Watch companion

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact support@sugarflag.app
