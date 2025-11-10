/**
 * Client-side encryption utilities for photos before transmission
 * Uses Web Crypto API for AES-GCM encryption
 */

/**
 * Generate a cryptographic key for encryption
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  )
}

/**
 * Export key to base64 string
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key)
  const exportedKeyBuffer = new Uint8Array(exported)
  const exportedAsString = String.fromCharCode.apply(null, Array.from(exportedKeyBuffer))
  return btoa(exportedAsString)
}

/**
 * Import key from base64 string
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
  const binaryString = atob(keyString)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return await crypto.subtle.importKey(
    'raw',
    bytes,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(
  data: ArrayBuffer,
  key: CryptoKey
): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  // Generate a random IV (initialization vector)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  )

  return { encrypted, iv }
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encryptedData
  )
}

/**
 * Encrypt a base64 image string
 */
export async function encryptImage(base64Image: string): Promise<{
  encryptedData: string
  iv: string
  key: string
}> {
  // Remove data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')

  // Convert base64 to binary
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  // Generate encryption key
  const key = await generateEncryptionKey()

  // Encrypt the data
  const { encrypted, iv } = await encryptData(bytes.buffer, key)

  // Convert to base64 for transmission
  const encryptedArray = new Uint8Array(encrypted)
  const encryptedBase64 = btoa(
    String.fromCharCode.apply(null, Array.from(encryptedArray))
  )

  const ivBase64 = btoa(String.fromCharCode.apply(null, Array.from(iv)))
  const keyBase64 = await exportKey(key)

  return {
    encryptedData: encryptedBase64,
    iv: ivBase64,
    key: keyBase64,
  }
}

/**
 * Decrypt an encrypted image
 */
export async function decryptImage(
  encryptedData: string,
  ivString: string,
  keyString: string
): Promise<string> {
  // Convert from base64
  const encryptedBinary = atob(encryptedData)
  const encryptedBytes = new Uint8Array(encryptedBinary.length)
  for (let i = 0; i < encryptedBinary.length; i++) {
    encryptedBytes[i] = encryptedBinary.charCodeAt(i)
  }

  const ivBinary = atob(ivString)
  const iv = new Uint8Array(ivBinary.length)
  for (let i = 0; i < ivBinary.length; i++) {
    iv[i] = ivBinary.charCodeAt(i)
  }

  // Import key
  const key = await importKey(keyString)

  // Decrypt
  const decrypted = await decryptData(encryptedBytes.buffer, key, iv)

  // Convert back to base64
  const decryptedArray = new Uint8Array(decrypted)
  const decryptedBase64 = btoa(
    String.fromCharCode.apply(null, Array.from(decryptedArray))
  )

  return `data:image/jpeg;base64,${decryptedBase64}`
}

/**
 * Hash data using SHA-256
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
