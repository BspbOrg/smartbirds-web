/**
 * Created by groupsky on 03.12.15.
 */

const angular = require('angular')
const leafletMap = require('../services/leafletMap')

// Polygons replace markers from this zoom on. A zone is a 1 km square, about
// 35 px across at zoom 12, and neighbouring zones sit about 2 km apart, so this
// is roughly where the Google clusterer used to let them separate.
const POLYGON_MIN_ZOOM = 12

// The selected fill had a typo (`opacitiy`) on Google, so it rendered at the
// default opacity of 0.3; this matches what rendered rather than the attribute.
const STYLES = {
  selected: {
    fill: { color: '#33c', opacity: 0.3 },
    stroke: { color: '#33c', opacity: 0.8, weight: 1 }
  },
  free: {
    fill: { color: '#3c3', opacity: 0.7 },
    stroke: { color: '#3c3', opacity: 0.8, weight: 1 }
  },
  taken: {
    fill: { color: '#c33', opacity: 0.4 },
    stroke: { color: '#c33', opacity: 0.7, weight: 1 }
  }
}

require('../app').directive('zonesMap', /* @ngInject */function () {
  return {
    restrict: 'AE',
    templateUrl: '/views/directives/zonemap.html',
    scope: {
      zones: '=',
      selectedZone: '=model'
    },
    controllerAs: 'map',
    controller: /* @ngInject */function ($scope) {
      const vc = this
      vc.center = leafletMap.DEFAULT_CENTER
      vc.zoom = leafletMap.DEFAULT_ZOOM
      vc.polygonMinZoom = POLYGON_MIN_ZOOM
      vc.markers = []
      // The zones themselves, so selectedZone works as the map's selection
      vc.polygons = []

      vc.zoneStyle = function (zone, selected) {
        if (selected) return STYLES.selected
        return zone.getStatus() === 'free' ? STYLES.free : STYLES.taken
      }

      // A marker stands for one zone too small to see; zoom in to it.
      vc.onMarkerClick = function (marker, eventName, center) {
        vc.center = { latitude: center.latitude, longitude: center.longitude }
        vc.zoom = POLYGON_MIN_ZOOM
      }

      vc.onPolygonClick = function (polygon, eventName, zone) {
        if (zone === $scope.selectedZone) {
          $scope.selectedZone = null
        } else if (zone.getStatus() === 'free') {
          $scope.selectedZone = zone
        }
      }

      function updateZones () {
        vc.markers = []
        vc.polygons = []
        angular.forEach($scope.zones, function (zone) {
          zone.coordinates = zone.coordinates || zone.path
          const center = zone.getCenter()
          if (!center) return
          vc.markers.push(center)
          vc.polygons.push(zone)
        })
      }

      $scope.$watchCollection('zones', updateZones)
    }
  }
})
