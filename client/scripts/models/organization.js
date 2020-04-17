var angular = require('angular')

require('../app').factory('Organization', /* @ngInject */function ($resource, ENDPOINT_URL, $translate, localization) {
  var Organization = $resource(ENDPOINT_URL + '/organization/:slug', {
    slug: '@slug'
  })

  // methods
  angular.extend(Organization.prototype, {
    toString: function (locale) {
      return localization.getLocalLabel(this.label, locale)
    }
  })

  return Organization
})
