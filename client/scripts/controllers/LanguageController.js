const languages = require('../../../config/languages')

require('../app').controller('LanguageController', /* @ngInject */function ($scope, $translate) {
  var ctrl = this
  ctrl.currentLanguageLabel = languages[$translate.$language].label
  ctrl.availableLanguages = languages
  ctrl.availableLanguagesFieldArray = Object.keys(languages).map(function (key) {
    return {
      id: key,
      label: languages[key].label
    }
  })
  ctrl.changeLanguage = function (language) {
    $translate.use(language)
    ctrl.currentLanguageLabel = languages[language].label
  }
})
