require('../app').service('localization', /* @ngInject */function ($rootScope, $translate) {
  $rootScope.$watch('$user.getIdentity().language', function (newVal, oldVal) {
    if (newVal) {
      $translate.use(newVal)
    }
  })
  var service = this

  /**
   * Determines the locale to use - priority to passed one, then current locale and finally english
   * @param {string} [locale?]
   * @returns {string}
   */
  service.normalizeNomenclatureLocale = function (locale) {
    return locale || $translate.$language || 'en'
  }

  /**
   * Returns the local label, or english one if local is unavailable
   * @param {{[string]: string, en: string}} label
   * @param {string} [locale?]
   * @param {(lowercase|uppercase)} [transform?] apply filter
   * @returns {string}
   */
  service.getLocalLabel = function (label, locale, transform) {
    if (label == null) return ''
    locale = service.normalizeNomenclatureLocale(locale)
    var value = label[locale] || label.en || ''
    if (value != null && transform != null) {
      switch (transform) {
        case 'lowercase':
          value = value.toLocaleLowerCase(locale)
          break
        case 'uppercase':
          value = value.toLocaleUpperCase(locale)
          break
        default:
          throw new Error('Unsupported transformation "' + transform + '"')
      }
    }
    return value
  }

  return service
})
