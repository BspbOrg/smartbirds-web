const languages = require('../../../config/languages')

require('../app').directive('navbarLanguageSwitcher', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/views/directives/navbarlanguageswitcher.html',
    controller: /* @ngInject */function ($translate) {
      var ctrl = this
      ctrl.currentLanguageLabel = languages[$translate.$language].label
      ctrl.availableLanguages = languages
      ctrl.changeLanguage = function (language) {
        $translate.use(language)
        ctrl.currentLanguageLabel = languages[language].label
      }
    },
    controllerAs: '$ctrl'
  }
})
