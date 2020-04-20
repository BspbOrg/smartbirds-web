/**
 * Created by groupsky on 12.01.16.
 */
var angular = require('angular')

require('../app').service('Nomenclature', /* @ngInject */function ($resource, $translate, ENDPOINT_URL, localization) {
  var Nomenclature = $resource(ENDPOINT_URL + '/nomenclature/:type/:label', {
    type: '@type',
    label: '@label'
  }, {
    updateGroup: { method: 'PUT', url: ENDPOINT_URL + '/nomenclature/:type', isArray: true }
  })

  // instance methods
  angular.extend(Nomenclature.prototype, {
    toString: function (locale) {
      return localization.getLocalLabel(this.label, locale)
    }
  })

  return Nomenclature
})
