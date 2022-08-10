/**
 * Created by groupsky on 12.01.16.
 */
const angular = require('angular')

require('../app').service('Poi', /* @ngInject */function ($resource, $translate, ENDPOINT_URL, localization) {
  const Poi = $resource(ENDPOINT_URL + '/pois/:type/:label', {
    type: '@type',
    label: '@label'
  }, {
    updateGroup: { method: 'PUT', url: ENDPOINT_URL + '/poi/:type', isArray: true }
  })

  // instance methods
  angular.extend(Poi.prototype, {
    toString: function (locale) {
      return localization.getLocalLabel(this.label, locale)
    }
  })

  return Poi
})
