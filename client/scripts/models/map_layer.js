/**
 * Created by groupsky on 12.01.16.
 */
const angular = require('angular')

require('../app').service('MapLayer', /* @ngInject */function ($resource, $translate, ENDPOINT_URL, localization) {
  const MapTiles = $resource(ENDPOINT_URL + '/map-layers/:type/:label', {
    type: '@type',
    label: '@label'
  }, {
    updateGroup: { method: 'PUT', url: ENDPOINT_URL + '/map-layers/:type', isArray: true }
  })

  // instance methods
  angular.extend(MapTiles.prototype, {
    toString: function (locale) {
      return localization.getLocalLabel(this.label, locale)
    }
  })

  return MapTiles
})
