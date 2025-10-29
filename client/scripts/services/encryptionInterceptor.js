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
      // Check if response is encrypted via header (more efficient than inspecting data)
      const encryptedHeader = response.headers && response.headers('X-SB-Encrypted')

      if (encryptedHeader && response && response.data) {
        // Verify the data structure matches encryption envelope
        if (!encryption.isEncrypted(response.data)) {
          console.warn('[encryptionInterceptor] X-SB-Encrypted header present but data is not encrypted envelope')
          return response
        }

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
