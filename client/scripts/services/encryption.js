/**
 * Encryption service for decrypting API responses
 * Uses Web Crypto API with AES-256-GCM
 */

const angular = require('angular')

require('../app').factory('encryption', /* @ngInject */function ($window, $q) {
  const crypto = $window.crypto || $window.msCrypto
  const subtle = crypto && crypto.subtle

  // Encryption key from environment (set at build time by envify)
  const API_ENCRYPTION_KEY = process.env.API_ENCRYPTION_KEY || ''

  /**
   * Convert hex string to Uint8Array
   */
  function hexToBytes (hex) {
    if (!hex || hex.length % 2 !== 0) {
      throw new Error('Invalid hex string')
    }
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
    }
    return bytes
  }

  /**
   * Convert base64 string to Uint8Array
   */
  function base64ToBytes (base64) {
    const binaryString = $window.atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  /**
   * Parse key string - try base64, then hex (same logic as server)
   */
  function parseKey (input) {
    if (!input) return null
    // try base64, then hex
    try {
      const b64 = base64ToBytes(input)
      if (b64.length === 32) return b64
    } catch (e) {}
    try {
      const hex = hexToBytes(input)
      if (hex.length === 32) return hex
    } catch (e) {}
    return null
  }

  /**
   * Import the encryption key (supports both hex and base64 formats)
   */
  function importKey (keyString) {
    const keyBytes = parseKey(keyString)
    if (!keyBytes) {
      throw new Error('Invalid encryption key format (need 32-byte key in hex or base64)')
    }
    return subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  function decrypt (key, ivBase64, tagBase64, payloadBase64) {
    const iv = base64ToBytes(ivBase64)
    const tag = base64ToBytes(tagBase64)
    const ciphertext = base64ToBytes(payloadBase64)

    // Concatenate ciphertext + tag for Web Crypto API
    const combined = new Uint8Array(ciphertext.length + tag.length)
    combined.set(ciphertext, 0)
    combined.set(tag, ciphertext.length)

    return subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      combined
    ).then(function (decrypted) {
      // Convert ArrayBuffer to string
      const decoder = new $window.TextDecoder('utf-8')
      const jsonString = decoder.decode(decrypted)
      return JSON.parse(jsonString)
    })
  }

  /**
   * Check if response data is encrypted
   * @param {*} data - Response data
   * @returns {boolean}
   */
  function isEncrypted (data) {
    return !!(angular.isObject(data) &&
      data.__enc === true &&
      data.alg === 'A256GCM' &&
      data.iv &&
      data.tag &&
      data.payload)
  }

  /**
   * Decrypt envelope if encrypted
   */
  function decryptIfNeeded (data) {
    // Not encrypted
    if (!isEncrypted(data)) {
      return $q.resolve(data)
    }

    // Check if Web Crypto API is available
    if (!subtle) {
      console.error('[encryption] Web Crypto API not available')
      return $q.reject(new Error('Web Crypto API not available'))
    }

    // Check if encryption key is configured
    if (!API_ENCRYPTION_KEY) {
      console.error('[encryption] API_ENCRYPTION_KEY not configured')
      return $q.reject(new Error('API encryption key not configured'))
    }

    // Decrypt
    return importKey(API_ENCRYPTION_KEY)
      .then(function (key) {
        return decrypt(key, data.iv, data.tag, data.payload)
      })
      .catch(function (error) {
        console.error('[encryption] Decryption failed:', error)
        return $q.reject(new Error('Failed to decrypt response: ' + error.message))
      })
  }

  return {
    isEncrypted,
    decryptIfNeeded
  }
})
