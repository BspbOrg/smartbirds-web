require('../app').directive('languageSwitcher', /* @ngInject */function ($compile) {
  return {
    restrict: 'A',
    templateUrl: '/views/directives/languageswitcher.html',
    link: function (scope, element) {
      element.addClass('dropdown')
      element.attr('uib-dropdown', '')
      element.removeAttr('language-switcher')
      $compile(element)(scope)
    },
    controller: 'LanguageController',
    controllerAs: '$ctrl'
  }
})
