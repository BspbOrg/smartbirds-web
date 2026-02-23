/**
 * Suspicious Activity Alerts List Controller
 */

const angular = require('angular')

require('../app').controller('SuspiciousActivityAlertsController', /* @ngInject */function ($scope, $state, $stateParams, SuspiciousActivityAlert, db, ngToast) {
  const controller = this

  // Filter options
  controller.statuses = [
    { value: 'new', label: 'SUSPICIOUS_ACTIVITY_STATUS_NEW' },
    { value: 'investigating', label: 'SUSPICIOUS_ACTIVITY_STATUS_INVESTIGATING' },
    { value: 'resolved', label: 'SUSPICIOUS_ACTIVITY_STATUS_RESOLVED' },
    { value: 'false_positive', label: 'SUSPICIOUS_ACTIVITY_STATUS_FALSE_POSITIVE' }
  ]

  controller.patternTypes = [
    { value: 'bulkOperations', label: 'SUSPICIOUS_ACTIVITY_PATTERN_BULK' },
    { value: 'rapidFire', label: 'SUSPICIOUS_ACTIVITY_PATTERN_RAPID' },
    { value: 'ipSwitching', label: 'SUSPICIOUS_ACTIVITY_PATTERN_IP' },
    { value: 'sessionAnomalies', label: 'SUSPICIOUS_ACTIVITY_PATTERN_SESSION' }
  ]

  // Initialize filter from state params
  controller.filter = {
    status: $stateParams.status || undefined,
    patternType: $stateParams.patternType || undefined,
    user: $stateParams.userId ? parseInt($stateParams.userId) : undefined,
    fromDate: $stateParams.fromDate ? new Date($stateParams.fromDate) : undefined,
    toDate: $stateParams.toDate ? new Date($stateParams.toDate) : undefined
  }

  // Data
  controller.alerts = []
  controller.stats = {}
  controller.count = 0
  controller.loading = false
  controller.hasError = false
  controller.errorMessage = ''
  controller.endOfPages = false
  controller.offset = 0
  controller.limit = 50
  controller.filterCollapsed = false

  // Fetch alerts from API
  controller.fetchAlerts = function (append) {
    if (controller.loading) return
    if (controller.hasError) return // Prevent retry loop on error

    controller.loading = true

    const params = {
      limit: controller.limit,
      offset: append ? controller.offset : 0,
      sortBy: 'detectedAt',
      sortOrder: 'DESC'
    }

    // Apply filters
    if (controller.filter.status) {
      params.status = controller.filter.status
    }
    if (controller.filter.patternType) {
      params.patternType = controller.filter.patternType
    }
    if (controller.filter.user) {
      params.userId = angular.isObject(controller.filter.user)
        ? controller.filter.user.id
        : controller.filter.user
    }
    if (controller.filter.fromDate) {
      params.fromDate = controller.filter.fromDate.toISOString()
    }
    if (controller.filter.toDate) {
      params.toDate = controller.filter.toDate.toISOString()
    }

    SuspiciousActivityAlert.query(params).$promise.then(function (alerts) {
      if (append) {
        controller.alerts = controller.alerts.concat(alerts)
      } else {
        controller.alerts = alerts
        controller.offset = 0
      }
      controller.count = alerts.$$response.data.$$response.count || 0
      controller.offset += alerts.length
      controller.endOfPages = !alerts.length || controller.offset >= controller.count
    }).catch(function (err) {
      controller.hasError = true
      controller.errorMessage = (err.data && err.data.error) || err.statusText || 'Failed to load alerts'
      ngToast.create({
        className: 'danger',
        content: 'Error loading alerts: ' + controller.errorMessage
      })
    }).finally(function () {
      controller.loading = false
    })
  }

  // Retry loading after error
  controller.retryLoad = function () {
    controller.hasError = false
    controller.errorMessage = ''
    controller.fetchAlerts(false)
    controller.fetchStats()
  }

  // Fetch statistics
  controller.fetchStats = function () {
    const params = {}
    if (controller.filter.fromDate) {
      params.fromDate = controller.filter.fromDate.toISOString()
    }
    if (controller.filter.toDate) {
      params.toDate = controller.filter.toDate.toISOString()
    }

    SuspiciousActivityAlert.stats(params).$promise.then(function (stats) {
      controller.stats = stats
    }).catch(function (err) {
      console.error('Error loading stats:', err)
    })
  }

  // Update filter and refresh data
  controller.updateFilter = function () {
    // Update state params
    const params = {
      status: controller.filter.status || null,
      patternType: controller.filter.patternType || null,
      userId: null,
      fromDate: null,
      toDate: null
    }

    if (controller.filter.user) {
      params.userId = angular.isObject(controller.filter.user)
        ? controller.filter.user.id
        : controller.filter.user
    }
    if (controller.filter.fromDate) {
      params.fromDate = controller.filter.fromDate.toISOString()
    }
    if (controller.filter.toDate) {
      params.toDate = controller.filter.toDate.toISOString()
    }

    $state.go('.', params, { notify: false })

    // Reset and fetch new data
    controller.hasError = false
    controller.errorMessage = ''
    controller.alerts = []
    controller.offset = 0
    controller.endOfPages = false
    controller.fetchAlerts(false)
    controller.fetchStats()
  }

  // Clear all filters
  controller.clearFilters = function () {
    controller.filter = {
      status: undefined,
      patternType: undefined,
      user: undefined,
      fromDate: undefined,
      toDate: undefined
    }
    controller.updateFilter()
  }

  // Load next page
  controller.nextPage = function () {
    if (controller.endOfPages || controller.loading) return
    controller.fetchAlerts(true)
  }

  // Navigate to detail view
  controller.viewDetail = function (alertId) {
    $state.go('auth.suspiciousActivityAlerts.detail', { id: alertId })
  }

  // Initial load
  controller.fetchAlerts(false)
  controller.fetchStats()
})
