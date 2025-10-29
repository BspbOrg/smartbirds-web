/**
 * HTTP interceptor to handle encrypted API responses
 * - Adds X-SB-Accept-Encrypted header to all API requests
 * - Automatically decrypts encrypted responses and restores metadata
 */

require('../app').factory('encryptionInterceptor', /* @ngInject */function ($q, encryption) {
  return {
    request: function (config) {
      // Add opt-in header for API requests
      if (config.url && config.url.indexOf('/api/') !== -1) {
        config.headers['X-SB-Accept-Encrypted'] = '1'
      }
      return config
    },

    response: function (response) {
      // Decrypt if response contains encrypted envelope
      if (response && response.data && encryption.isEncrypted(response.data)) {
        // Preserve the original response metadata added by unwrapApi
        const originalMetadata = response.data.$$response

        return encryption.decryptIfNeeded(response.data, response.headers)
          .then(function (decryptedData) {
            // Replace with decrypted data
            response.data = decryptedData

            // Restore the $$response reference to maintain compatibility with unwrapApi expectations
            // This allows code that checks response.data.$$response to still work
            if (originalMetadata) {
              response.data.$$response = originalMetadata
            }

            return response
          })
          .catch(function (error) {
            console.error('[encryptionInterceptor] Decryption failed:', error)
            return $q.reject(response)
          })
      }
      return response
    }
  }
})
