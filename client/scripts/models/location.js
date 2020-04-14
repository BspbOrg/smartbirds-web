/**
 * Created by groupsky on 03.12.15.
 */

var angular = require('angular')

require('../app').factory('Location', /* @ngInject */function ($resource, ENDPOINT_URL, localization) {
  var Location = $resource(ENDPOINT_URL + '/locations/:id', {
    id: '@id'
  })

  // instance methods
  angular.extend(Location.prototype, {
    getArea: function (locale) {
      return localization.getLocalLabel(this.area, locale)
    },
    getName: function (locale) {
      return localization.getLocalLabel(this.name, locale)
    },
    getType: function (locale) {
      return localization.getLocalLabel(this.type, locale)
    },
    toString: function (locale) {
      return Location.prototype.getType.apply(this, locale) + ' ' +
        Location.prototype.getName.apply(this, locale) + ', ' +
        Location.prototype.getArea.apply(this, locale)
    }
  })

  return Location
})
