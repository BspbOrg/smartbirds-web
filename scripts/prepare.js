// Husky v9+ doesn't need install() - just set git config
// Ensure we're not in production or CI
const isProduction = process.env.NODE_ENV === 'production'
const isCi = process.env.CI !== undefined

if (!isCi && !isProduction) {
  const { execSync } = require('child_process')
  try {
    // Set git hooks path for husky v9
    execSync('git config core.hooksPath .husky', { stdio: 'inherit' })
    console.log('Husky git hooks configured (.husky)')
  } catch (e) {
    console.log('Skipping git hooks setup (not a git repository)')
  }
}
