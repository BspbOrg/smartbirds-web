/**
 * Created by groupsky on 20.11.15.
 */

var angular = require('angular')
var isUndefined = angular.isUndefined

require('../app').factory('Zone', /* @ngInject */function ($resource, $translate, ENDPOINT_URL, Location) {
  var Zone = $resource(ENDPOINT_URL + '/zone/:id', {
    id: '@id'
  }, {
    listByLocation: {
      method: 'GET',
      params: {
        locationId: '@locationId',
        filter: '@filter'
      },
      url: ENDPOINT_URL + '/locations/:locationId/zones/:filter',
      isArray: true
    },
    listByArea: {
      method: 'GET',
      params: {
        area: '@area',
        filter: '@filter'
      },
      url: ENDPOINT_URL + '/area/:area/zones/:filter',
      isArray: true
    },
    request: {
      method: 'POST',
      params: {
        id: '@id'
      },
      url: ENDPOINT_URL + '/zone/:id/owner'
    },
    respond: {
      method: 'POST',
      params: {
        id: '@id'
      },
      url: ENDPOINT_URL + '/zone/:id/owner/response'
    },
    removeOwner: {
      method: 'DELETE',
      params: {
        id: '@id'
      },
      url: ENDPOINT_URL + '/zone/:id/owner'
    },
    setOwner: {
      method: 'PUT',
      params: {
        id: '@id'
      },
      url: ENDPOINT_URL + '/zone/:id/owner'
    }
  })

  // methods
  angular.extend(Zone.prototype, {
    getCenter: function () {
      if (isUndefined(this.coordinates)) return
      if (!this.center) {
        this.center = {
          latitude: this.coordinates.reduce(function (sum, point) {
            return sum + point.latitude
          }, 0) / this.coordinates.length,
          longitude: this.coordinates.reduce(function (sum, point) {
            return sum + point.longitude
          }, 0) / this.coordinates.length
        }
      }
      return this.center
    },
    getStatus: function () {
      return this.status
    },
    $respond: function (response) {
      var self = this
      if (response) {
        this.status = 'owned'
      } else {
        this.status = 'free'
        this.owner = null
        this.ownerId = null
      }
      return Zone.respond.call(this, { id: this.id }, { response: response }).then(function (response) {
        var data = response.data
        if (data) {
          Zone.call(self, data)
        }
      })
    },
    $removeOwner: function () {
      this.ownerId = null
      this.owner = null
      this.status = 'free'
      return Zone.removeOwner.call(this, { id: this.id }, this)
    },

    $setOwner: function (owner) {
      var self = this
      this.owner = owner
      this.ownerId = owner.id
      this.status = 'owned'
      return Zone.setOwner.call(this, { id: this.id }, { owner: owner.id }).then(function (response) {
        var data = response.data
        if (data) {
          Zone.call(self, data)
        }
      })
    },

    toString: function (locale) {
      return this.id + ', ' + Location.prototype.toString.apply(this.location, locale)
    },

    linkUrl: function () {
      return ENDPOINT_URL + '/zone/' + this.id
    }
  })

  Zone.statuses = function () {
    return {
      free: $translate.instant('zone free'),
      requested: $translate.instant('zone requested'),
      owned: $translate.instant('zone owned')
    }
  }

  return Zone
})
