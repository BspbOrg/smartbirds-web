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
        const originalResponse = response.data.$$response

        return encryption.decryptIfNeeded(response.data, response.headers)
          .then(function (decryptedData) {
            // Replace with decrypted data
            response.data = decryptedData

            // Restore all metadata from original response (preserving any future fields)
            if (originalResponse) {
              for (const key in originalResponse) {
                if (key !== 'data' && Object.prototype.hasOwnProperty.call(originalResponse, key)) {
                  response.data[key] = originalResponse[key]
                }
              }
              response.data.$$response = originalResponse
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
