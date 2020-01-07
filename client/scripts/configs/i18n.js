var hackProviders = {}
const languages = require('../../../config/languages')

require('../app')
  .config(/* @ngInject */function (nyaBsConfigProvider) {
    // dummy hack to allow runtime update of the translation matrix
    hackProviders.nyaBsConfigProvider = nyaBsConfigProvider
  })
  .config(/* @ngInject */function ($translateProvider, ENDPOINT_URL) {
    if (process.env.TRANSLATION_PREFIX) {
      $translateProvider.useUrlLoader(process.env.TRANSLATION_PREFIX)
    } else {
      // TODO Load files depending on config languages
      $translateProvider.translations('en', require('../../../i18n/en.json'))
      $translateProvider.translations('bg', require('../../../i18n/bg.json'))
    }

    var languageAliases = {}
    Object.keys(languages).forEach(function (key) {
      languageAliases[key + '_*'] = key
    })
    languageAliases['*'] = 'en'

    $translateProvider
      .registerAvailableLanguageKeys(Object.keys(languages), languageAliases)
      .determinePreferredLanguage(function () {
        var m = global.location.search.match(/lang=(\w+)/)
        if (m) return m[1]
        return $translateProvider.resolveClientLocale() || 'bg'
      })
  })
  .run(/* @ngInject */function ($translate, $rootScope) {
    function updateLang (language) {
      $rootScope.localeLanguage = $rootScope.$language = $translate.$language = language
      hackProviders.nyaBsConfigProvider.setLocalizedText(language, {
        defaultNoneSelection: $translate.instant('MULTIPLE_CHOICE_DEFAULT_NONE_SELECTION'),
        noSearchResults: $translate.instant('MULTIPLE_CHOICE_NO_SEARCH_RESULTS'),
        numberItemSelected: $translate.instant('MULTIPLE_CHOICE_NUMBER_ITEM_SELECTED')
      })
      hackProviders.nyaBsConfigProvider.useLocale(language)
    }

    updateLang($translate.proposedLanguage())
    $rootScope.$on('$translateChangeSuccess', function (e, params) { updateLang(params.language) })
  })
  .config(/* @ngInject */function ($httpProvider) {
    $httpProvider.interceptors.push('languageInterceptor')
  })
