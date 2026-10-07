/**
 * Created by groupsky on 20.11.15.
 */

const angular = require('angular')
require('../app').controller('ZonesController', /* @ngInject */function ($scope, $state, $stateParams, Zone, user, User, localization) {
  const controller = this

  $scope.getLocalLabel = localization.getLocalLabel

  $scope.zoneStatuses = Zone.statuses()
  if (!user.isAdmin() && !user.isModerator('cbm')) {
    delete $scope.zoneStatuses.free
  }
  controller.filter = angular.copy($stateParams)
  if (controller.filter.status && !angular.isArray(controller.filter.status)) {
    controller.filter.status = [controller.filter.status]
  }
  $scope.rows = []
  $scope.visibleRows = []

  controller.updateSearch = function () {
    if (angular.equals(controller.filter, $stateParams)) { return }
    $state.go('.', controller.filter, {
      notify: false
    })
    controller.requestRows()
  }

  controller.requestRows = function () {
    $scope.rows = Zone.query(controller.filter)
    $scope.rows.$promise.then(controller.filterRows)
  }

  controller.getUsers = function (filter) {
    if (controller.loadingUsers && controller.loadingUsers.cancel) { controller.loadingUsers.cancel() }
    const users = User.query({ q: filter })
    controller.loadingUsers = users.$promise
    users.$promise.finally(function () {
      controller.loadingUsers = null
    })
    return users.$promise
  }

  controller.filterRows = function () {
    const filter = controller.filterZones(controller.filter)
    $scope.visibleRows = []
    $scope.rows.every(function (row) {
      if (filter(row)) $scope.visibleRows.push(row)
      return $scope.visibleRows.length < 25
    })
  }

  controller.rejectRequest = function (zone) {
    zone.$respond(false)
  }

  controller.approveRequest = function (zone) {
    zone.$respond(true)
  }

  controller.removeOwner = function (zone) {
    zone.$removeOwner()
  }

  controller.setOwner = function (zone, owner) {
    zone.$setOwner(owner)
  }

  controller.filterZones = function (filter) {
    return function (zone) {
      if (filter && filter.zone) {
        if (filter.zone !== zone.id) return false
      }

      if (filter && filter.status && filter.status.length) {
        if (filter.status.indexOf(zone.status) === -1) return false
      }

      if (filter && filter.owner) {
        if (angular.isArray(filter.owner)) {
          if (filter.owner.length) {
            if (filter.owner.indexOf(zone.ownerId) === -1) return false
          }
        } else if (angular.isObject(filter.owner)) {
          if (filter.owner.id) {
            if (filter.owner.id !== zone.ownerId) return false
          }
        } else {
          if (filter.owner !== zone.ownerId) return false
        }
      }

      if (filter && filter.location) {
        if (filter.location !== zone.locationId) {
          return false
        }
      }

      if (!user.isAdmin() && !user.isModerator('cbm') && zone.status !== 'free') {
        if (user.getIdentity().id !== zone.ownerId) return false
      }
      return true
    }
  }

  controller.requestRows()
  $scope.$watch(function () { return controller.filter }, controller.filterRows, true)
})
