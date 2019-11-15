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
      locale = localization.normalizeNomenclatureLocale(locale)
      return (this.area || {})[locale]
    },
    getName: function (locale) {
      locale = localization.normalizeNomenclatureLocale(locale)
      return (this.name || {})[locale]
    },
    getType: function (locale) {
      locale = localization.normalizeNomenclatureLocale(locale)
      return (this.type || {})[locale]
    },
    toString: function (locale) {
      locale = localization.normalizeNomenclatureLocale(locale)
      return (this.type || {})[locale] + ' ' + (this.name || {})[locale] + ', ' + (this.area || {})[locale]
    }
  })

  return Location
})
