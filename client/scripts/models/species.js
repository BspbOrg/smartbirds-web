/**
 * Created by groupsky on 12.01.16.
 */
var angular = require('angular')

require('../app').service('Species', /* @ngInject */function ($resource, $translate, ENDPOINT_URL, localization) {
  var Species = $resource(ENDPOINT_URL + '/species/:type/:la', {
    type: '@type',
    la: '@la'
  }, {
    updateGroup: { method: 'PUT', url: ENDPOINT_URL + '/species/:type', isArray: true }
  })

  // instance methods
  angular.extend(Species.prototype, {
    localeLabel: function (locale) {
      return localization.getLocalLabel(this.label, locale)
    },
    toString: function (locale) {
      return this.label.la + ' | ' + Species.prototype.localeLabel.apply(this, locale)
    }
  })

  return Species
})
