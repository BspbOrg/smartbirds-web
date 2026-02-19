const angular = require('angular')

require('../app').factory('SuspiciousActivityAlert', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  const SuspiciousActivityAlert = $resource(ENDPOINT_URL + '/suspicious-activity-alert/:id', {
    id: '@id'
  }, {
    // Custom actions (query, get, update use defaults from $resourceProvider)
    update: {
      method: 'POST'
    },
    stats: {
      method: 'GET',
      url: ENDPOINT_URL + '/suspicious-activity-alert/stats'
    }
  })

  // Instance methods
  angular.extend(SuspiciousActivityAlert.prototype, {
    getUser: function () {
      return this.userId ? db.users[this.userId] : null
    },
    getResolvedBy: function () {
      return this.resolvedBy ? db.users[this.resolvedBy] : null
    },
    // Get icon class for pattern type
    getPatternIcon: function () {
      const iconMap = {
        bulkOperations: 'fa-database',
        rapidFire: 'fa-bolt',
        ipSwitching: 'fa-exchange',
        sessionAnomalies: 'fa-warning'
      }
      return iconMap[this.patternType] || 'fa-question'
    },
    // Get badge class for status
    getStatusClass: function () {
      const classMap = {
        new: 'label-danger',
        investigating: 'label-warning',
        resolved: 'label-success',
        false_positive: 'label-default'
      }
      return classMap[this.status] || 'label-default'
    }
  })

  return SuspiciousActivityAlert
})
