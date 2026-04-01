const angular = require('angular')

require('../app').factory('AccessAudit', /* @ngInject */function ($resource, $http, ENDPOINT_URL, db) {
  const AccessAudit = $resource(ENDPOINT_URL + '/access-audit/:id', {
    id: '@id'
  })

  AccessAudit.summary = function (params) {
    return $http.get(ENDPOINT_URL + '/access-audit/summary', { params })
  }

  // instance methods
  angular.extend(AccessAudit.prototype, {
    getActor: function () {
      return db.users[this.actorUserId]
    },
    getOwner: function () {
      return this.ownerUserId ? db.users[this.ownerUserId] : null
    }
  })

  return AccessAudit
})
