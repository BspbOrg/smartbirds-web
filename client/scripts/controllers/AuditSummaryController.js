/**
 * Access Audit Summary Controller
 */

require('../app').controller('AuditSummaryController', /* @ngInject */function (AccessAudit, db, $filter) {
  const controller = this

  // Default to today formatted as YYYY-MM-DD
  const today = new Date()
  controller.date = $filter('date')(today, 'yyyy-MM-dd')
  controller.dateOpen = false

  controller.rows = []
  controller.loading = false
  controller.error = false

  controller.getActorUser = function (actorUserId) {
    return db.users[actorUserId]
  }

  controller.fetchSummary = function () {
    if (controller.loading) return

    controller.loading = true
    controller.error = false

    const dateStr = controller.date instanceof Date
      ? $filter('date')(controller.date, 'yyyy-MM-dd')
      : controller.date

    AccessAudit.summary({ date: dateStr }).then(function (response) {
      controller.rows = response.data || []
    }, function () {
      controller.error = true
      controller.rows = []
    }).finally(function () {
      controller.loading = false
    })
  }

  controller.onDateChange = function () {
    controller.fetchSummary()
  }

  controller.clearDate = function () {
    controller.date = $filter('date')(new Date(), 'yyyy-MM-dd')
    controller.fetchSummary()
  }

  controller.isToday = function () {
    const dateStr = controller.date instanceof Date
      ? $filter('date')(controller.date, 'yyyy-MM-dd')
      : controller.date
    return dateStr === $filter('date')(new Date(), 'yyyy-MM-dd')
  }

  // Initial load
  controller.fetchSummary()
})
