import Foundation
import CryptoKit

/// Manages client-side encryption for sensitive data like scan photos
class CryptoManager {
    private let keychain = KeychainManager()
    private let encryptionKeyTag = "com.sugarflag.encryptionKey"

    /// Encrypts data using AES-GCM
    func encrypt(_ data: Data) throws -> EncryptedData {
        let key = try getOrCreateEncryptionKey()
        let sealedBox = try AES.GCM.seal(data, using: key)

        guard let combined = sealedBox.combined else {
            throw CryptoError.encryptionFailed
        }

        return EncryptedData(
            ciphertext: combined.base64EncodedString(),
            algorithm: "AES-GCM-256"
        )
    }

    /// Decrypts data using AES-GCM
    func decrypt(_ encryptedData: EncryptedData) throws -> Data {
        guard let combined = Data(base64Encoded: encryptedData.ciphertext) else {
            throw CryptoError.invalidData
        }

        let key = try getOrCreateEncryptionKey()
        let sealedBox = try AES.GCM.SealedBox(combined: combined)
        return try AES.GCM.open(sealedBox, using: key)
    }

    /// Encrypts an image for secure upload
    func encryptImage(_ imageData: Data) throws -> EncryptedData {
        return try encrypt(imageData)
    }

    /// Decrypts an image
    func decryptImage(_ encryptedData: EncryptedData) throws -> Data {
        return try decrypt(encryptedData)
    }

    // MARK: - Private Methods

    private func getOrCreateEncryptionKey() throws -> SymmetricKey {
        // Try to load existing key from keychain
        if let existingKeyData = keychain.get(key: encryptionKeyTag),
           let keyData = Data(base64Encoded: existingKeyData) {
            return SymmetricKey(data: keyData)
        }

        // Generate new key
        let key = SymmetricKey(size: .bits256)
        let keyData = key.withUnsafeBytes { Data($0) }
        keychain.save(key: encryptionKeyTag, value: keyData.base64EncodedString())

        return key
    }

    /// Deletes the encryption key (use with caution!)
    func deleteEncryptionKey() {
        keychain.delete(key: encryptionKeyTag)
    }
}

// MARK: - Supporting Types

struct EncryptedData: Codable {
    let ciphertext: String
    let algorithm: String
}

enum CryptoError: LocalizedError {
    case encryptionFailed
    case decryptionFailed
    case invalidData
    case keyGenerationFailed

    var errorDescription: String? {
        switch self {
        case .encryptionFailed:
            return "Failed to encrypt data"
        case .decryptionFailed:
            return "Failed to decrypt data"
        case .invalidData:
            return "Invalid encrypted data"
        case .keyGenerationFailed:
            return "Failed to generate encryption key"
        }
    }
}
