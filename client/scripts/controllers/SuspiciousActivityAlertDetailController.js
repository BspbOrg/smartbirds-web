/**
 * Suspicious Activity Alert Detail Controller
 */

require('../app').controller('SuspiciousActivityAlertDetailController', /* @ngInject */function ($scope, $state, $stateParams, SuspiciousActivityAlert, db, ngToast, $translate) {
  const controller = this

  controller.alert = null
  controller.loading = true
  controller.user = null
  controller.resolvedByUser = null
  controller.showRawData = false // Collapsible raw JSON data panel

  // Edit state
  controller.editForm = {
    status: null,
    adminNotes: null
  }
  controller.isDirty = false

  // Status options
  controller.statuses = [
    { value: 'new', label: 'SUSPICIOUS_ACTIVITY_STATUS_NEW' },
    { value: 'investigating', label: 'SUSPICIOUS_ACTIVITY_STATUS_INVESTIGATING' },
    { value: 'resolved', label: 'SUSPICIOUS_ACTIVITY_STATUS_RESOLVED' },
    { value: 'false_positive', label: 'SUSPICIOUS_ACTIVITY_STATUS_FALSE_POSITIVE' }
  ]

  // Load alert details
  controller.loadAlert = function () {
    controller.loading = true

    SuspiciousActivityAlert.get({ id: $stateParams.id }).$promise.then(function (alert) {
      controller.alert = alert
      controller.user = alert.getUser()
      controller.resolvedByUser = alert.getResolvedBy()

      // Initialize edit form
      controller.editForm = {
        status: alert.status,
        adminNotes: alert.adminNotes || ''
      }
    }).catch(function (err) {
      ngToast.create({
        className: 'danger',
        content: 'Error loading alert: ' + ((err.data && err.data.error) || err.statusText)
      })
      $state.go('auth.suspiciousActivityAlerts')
    }).finally(function () {
      controller.loading = false
    })
  }

  // Track form changes
  $scope.$watch('alertController.editForm', function (newVal, oldVal) {
    if (controller.alert && newVal && oldVal) {
      controller.isDirty = (
        newVal.status !== controller.alert.status ||
        newVal.adminNotes !== (controller.alert.adminNotes || '')
      )
    }
  }, true)

  // Update alert
  controller.updateAlert = function () {
    SuspiciousActivityAlert.update({
      id: controller.alert.id,
      status: controller.editForm.status,
      adminNotes: controller.editForm.adminNotes
    }).$promise.then(function () {
      ngToast.create({
        className: 'success',
        content: $translate.instant('SUSPICIOUS_ACTIVITY_UPDATE_SUCCESS')
      })
      controller.isDirty = false
      controller.loadAlert()
    }).catch(function (err) {
      ngToast.create({
        className: 'danger',
        content: $translate.instant('SUSPICIOUS_ACTIVITY_UPDATE_ERROR') + ': ' + ((err.data && err.data.error) || err.statusText)
      })
    })
  }

  // Go back to list
  controller.goBack = function () {
    $state.go('auth.suspiciousActivityAlerts')
  }

  // Initial load
  controller.loadAlert()
})
