const languages = require('../../../config/languages')

require('../app').directive('navbarLanguageSwitcher', function ($compile) {
  return {
    restrict: 'A',
    templateUrl: '/views/directives/navbarlanguageswitcher.html',
    link: function (scope, element) {
      element.addClass('dropdown')
      element.attr('uib-dropdown', '')
      element.removeAttr('navbar-language-switcher')
      $compile(element)(scope)
    },
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
