const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents (on, config) {},
    baseUrl: 'http://localhost:9966',
    supportFile: false
  }
})
