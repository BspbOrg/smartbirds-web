const isProduction = process.env.NODE_ENV === 'production'
const isCi = process.env.CI !== undefined

if (!isCi && !isProduction) {
  try {
    require('husky').install()
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND')
      throw e
  }
}
