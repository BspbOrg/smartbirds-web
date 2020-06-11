require('../app')
  .filter('localLabel', /* @ngInject */function (localization) {
    return function (label, locale) {
      return localization.getLocalLabel(label, locale)
    }
  })
