require('../app').factory('languageInterceptor', /* @ngInject */function ($injector) {
  var $translate
  return {
    request: function (config) {
      try {
        if (!$translate) {
          $translate = $injector.get('$translate')
        }
        config.headers.Language = $translate.$language
      } catch (e) {
        console.warn(e)
      }
      return config
    }
  }
})
