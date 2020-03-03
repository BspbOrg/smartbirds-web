require('../app').service('localization', /* @ngInject */function ($rootScope, $translate) {
  $rootScope.$watch('$user.getIdentity().language', function (newVal, oldVal) {
    if (newVal) {
      $translate.use(newVal)
    }
  })
  var service = this

  service.normalizeNomenclatureLocale = function (locale) {
    var res = locale || $translate.$language || 'en'
    if (res !== 'en') {
      res = 'local'
    }
    return res
  }

  return service
})
