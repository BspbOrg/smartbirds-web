/**
 * Created by groupsky on 12.11.15.
 */

var angular = require('angular')
var md5 = require('blueimp-md5')

require('../app').factory('User', /* @ngInject */function ($resource, $translate, BANNER_BASE_URL, ENDPOINT_URL) {
  var User = $resource(ENDPOINT_URL + '/user/:id', {
    id: '@id'
  }, {
    // api methods
    getSharers: { method: 'GET', url: ENDPOINT_URL + '/user/:id/sharers', isArray: true, cache: true },
    getSharees: { method: 'GET', url: ENDPOINT_URL + '/user/:id/sharees', isArray: true },
    saveSharees: { method: 'POST', url: ENDPOINT_URL + '/user/:id/sharees', isArray: true }
  })

  // methods
  angular.extend(User.prototype, {
    getName: function () {
      return [this.firstName, this.lastName].filter(function (s) {
        return !!s
      }).join(' ')
    },
    hasRole: function (role) {
      if (!this.roles) return false
      return this.roles.indexOf(role) !== -1
    },
    toString: function () {
      return this.getName()
    },
    getBannerUrl: function () {
      if (!this.bannerUrl) { this.bannerUrl = BANNER_BASE_URL + md5(this.id) + '-' + $translate.$language + '.png' }
      return this.bannerUrl
    }
  })

  return User
})
