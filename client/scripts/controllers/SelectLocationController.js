const defaults = require('lodash/defaults')
const leaflet = require('leaflet')
const leafletMap = require('../services/leafletMap')

require('../app').controller('SelectLocationController', /* @ngInject */function ($scope, $timeout, $uibModalInstance, location) {
  const $ctrl = this

  $ctrl.mapProvider = 'osm'
  $ctrl.location = defaults({}, location, { radius: '5' })
  $ctrl.radiusChoices = [
    { id: '0.5', label: 'DISTANCE_500_M' },
    { id: '1', label: 'DISTANCE_1_KM' },
    { id: '2', label: 'DISTANCE_2_KM' },
    { id: '5', label: 'DISTANCE_5_KM' },
    { id: '10', label: 'DISTANCE_10_KM' }
  ]

  // The fields can hold strings, and an empty one would read as 0 on the map,
  // so the maps get parsed numbers, or nothing when a value is missing.
  //
  // The server filters by the box around the radius, not the circle, so both maps draw that box.
  $ctrl.updateRadius = function () {
    const latitude = parseFloat($ctrl.location.latitude)
    const longitude = parseFloat($ctrl.location.longitude)
    const radius = parseFloat($ctrl.location.radius)
    $ctrl.point = isFinite(latitude) && isFinite(longitude) ? { latitude, longitude } : null
    $ctrl.radiusCoordinates = []
    if (!$ctrl.point || !isFinite(radius)) return
    // toBounds takes the box's full side in metres: radius in km × 1000 × 2
    const bounds = leaflet.latLng(latitude, longitude).toBounds(radius * 2000)
    $ctrl.radiusCoordinates = [bounds.getSouthWest(), bounds.getSouthEast(), bounds.getNorthEast(), bounds.getNorthWest()].map(function (corner) {
      return { latitude: corner.lat, longitude: corner.lng }
    })
  }

  $ctrl.updateRadius()

  $ctrl.map = {
    center: Object.assign({}, $ctrl.point || leafletMap.DEFAULT_CENTER),
    zoom: leafletMap.DEFAULT_ZOOM,
    click: function (maps, event, scope, args) {
      if (typeof args === 'undefined') {
        args = scope
        scope = undefined
      }
      $timeout(function () {
        $ctrl.location.latitude = Math.round(args[0].latLng.lat() * 1000000) / 1000000
        $ctrl.location.longitude = Math.round(args[0].latLng.lng() * 1000000) / 1000000
        $ctrl.updateRadius()
      })
    }
  }

  $ctrl.locationSelected = function () {
    $uibModalInstance.close($ctrl.location)
  }
})
