var angular = require('angular')

require('../app').factory('Organization', /* @ngInject */function ($resource, ENDPOINT_URL, $translate) {
  var Organization = $resource(ENDPOINT_URL + '/organization/:slug', {
    slug: '@slug'
  })

  // methods
  angular.extend(Organization.prototype, {

    toString: function (locale) {
      locale = locale || $translate.$language || 'en'
      return (this.label || {})[locale]
    }

  })

  return Organization
})
