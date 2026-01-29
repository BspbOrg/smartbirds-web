/**
 * Access Audit Log Controller
 */

const angular = require('angular')
const forms = require('../configs/forms')

require('../app').controller('AuditController', /* @ngInject */function ($scope, $state, $stateParams, AccessAudit, User) {
  const controller = this

  // Available filter options
  controller.recordTypes = Object.keys(forms)
    .map(key => forms[key].serverModel)

  // Map serverModel to shortLabel translation key
  controller.recordTypeLabels = {}
  Object.keys(forms).forEach(key => {
    const form = forms[key]
    controller.recordTypeLabels[form.serverModel] = form.shortLabel
  })

  // Helper to get translation key for a recordType
  controller.getRecordTypeLabel = function (recordType) {
    return controller.recordTypeLabels[recordType] || recordType
  }

  controller.actions = [
    'VIEW',
    'EDIT',
    'DELETE',
    'LIST',
    'EXPORT'
  ]

  // Initialize filter from state params
  controller.filter = {
    actorUser: $stateParams.actorUserId ? parseInt($stateParams.actorUserId) : undefined,
    ownerUser: $stateParams.ownerUserId ? parseInt($stateParams.ownerUserId) : undefined,
    recordType: $stateParams.recordType || undefined,
    recordId: $stateParams.recordId || undefined,
    userAction: $stateParams.userAction || undefined,
    fromDate: $stateParams.fromDate ? new Date($stateParams.fromDate) : undefined,
    toDate: $stateParams.toDate ? new Date($stateParams.toDate) : undefined,
    operationId: $stateParams.operationId || undefined
  }

  // Data
  controller.rows = []
  controller.count = 0
  controller.loading = false
  controller.endOfPages = false
  controller.offset = 0
  controller.limit = 50

  // Fetch rows from API
  controller.fetchRows = function (append) {
    if (controller.loading) return

    controller.loading = true

    const params = {
      limit: controller.limit,
      offset: append ? controller.offset : 0,
      sortBy: 'occurredAt',
      sortOrder: 'DESC'
    }

    // Apply filters - extract IDs from user objects if needed
    if (controller.filter.actorUser) {
      params.actorUserId = angular.isObject(controller.filter.actorUser)
        ? controller.filter.actorUser.id
        : controller.filter.actorUser
    }
    if (controller.filter.ownerUser) {
      params.ownerUserId = angular.isObject(controller.filter.ownerUser)
        ? controller.filter.ownerUser.id
        : controller.filter.ownerUser
    }
    if (controller.filter.recordType) {
      params.recordType = controller.filter.recordType
    }
    if (controller.filter.recordId) {
      params.recordId = controller.filter.recordId
    }
    if (controller.filter.userAction) {
      params.userAction = controller.filter.userAction
    }
    if (controller.filter.fromDate) {
      params.fromDate = controller.filter.fromDate.toISOString()
    }
    if (controller.filter.toDate) {
      params.toDate = controller.filter.toDate.toISOString()
    }
    if (controller.filter.operationId) {
      params.operationId = controller.filter.operationId
    }

    AccessAudit.query(params).$promise.then(function (rows) {
      if (append) {
        controller.rows = controller.rows.concat(rows)
      } else {
        controller.rows = rows
        controller.offset = 0
      }
      controller.count = rows.$$response.data.$$response.count || 0
      controller.offset += rows.length
      controller.endOfPages = !rows.length || controller.offset >= controller.count
    }).finally(function () {
      controller.loading = false
    })
  }

  // Update filter and refresh data
  controller.updateFilter = function () {
    // Update state params - explicitly set to null to clear from URL
    const params = {
      actorUserId: null,
      ownerUserId: null,
      recordType: null,
      recordId: null,
      userAction: null,
      fromDate: null,
      toDate: null,
      operationId: null
    }

    // Handle actorUser - can be either a user object or user ID
    if (controller.filter.actorUser) {
      params.actorUserId = angular.isObject(controller.filter.actorUser)
        ? controller.filter.actorUser.id
        : controller.filter.actorUser
    }

    // Handle ownerUser - can be either a user object or user ID
    if (controller.filter.ownerUser) {
      params.ownerUserId = angular.isObject(controller.filter.ownerUser)
        ? controller.filter.ownerUser.id
        : controller.filter.ownerUser
    }

    if (controller.filter.recordType) {
      params.recordType = controller.filter.recordType
    }
    if (controller.filter.recordId) {
      params.recordId = controller.filter.recordId
    }
    if (controller.filter.userAction) {
      params.userAction = controller.filter.userAction
    }
    if (controller.filter.fromDate) {
      params.fromDate = controller.filter.fromDate.toISOString()
    }
    if (controller.filter.toDate) {
      params.toDate = controller.filter.toDate.toISOString()
    }
    if (controller.filter.operationId) {
      params.operationId = controller.filter.operationId
    }

    $state.go('.', params, { notify: false })

    // Reset and fetch new data
    controller.rows = []
    controller.offset = 0
    controller.endOfPages = false
    controller.fetchRows(false)
  }

  // Clear all filters
  controller.clearFilters = function () {
    controller.filter = {
      actorUser: undefined,
      ownerUser: undefined,
      recordType: undefined,
      recordId: undefined,
      userAction: undefined,
      fromDate: undefined,
      toDate: undefined,
      operationId: undefined
    }
    controller.updateFilter()
  }

  // Load next page
  controller.nextPage = function () {
    if (controller.endOfPages || controller.loading) return
    controller.fetchRows(true)
  }

  // Navigate to record detail page
  controller.viewRecord = function (recordType, recordId) {
    // Dynamically build state map from forms config
    const stateMap = {}
    Object.keys(forms).forEach(function (key) {
      const form = forms[key]
      stateMap[form.serverModel] = 'auth.monitoring.private.' + key
    })

    const stateName = stateMap[recordType]
    if (stateName) {
      $state.go(stateName + '.detail', { id: recordId })
    } else {
      console.warn('No state mapping found for recordType:', recordType)
    }
  }

  // Filter by operation ID
  controller.filterByOperationId = function (operationId) {
    controller.filter.operationId = operationId
    controller.updateFilter()
  }

  // Get action badge class
  controller.getActionClass = function (action) {
    const classMap = {
      VIEW: 'label-info',
      EDIT: 'label-warning',
      DELETE: 'label-danger',
      LIST: 'label-primary',
      EXPORT: 'label-success'
    }
    return classMap[action] || 'label-default'
  }

  // Initial load
  controller.fetchRows(false)
})
