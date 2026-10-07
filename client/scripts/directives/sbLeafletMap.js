const leaflet = require('leaflet')
const leafletMap = require('../services/leafletMap')
const mapStyles = require('../services/mapStyles')

// For `static`: nothing can move the map.
const STATIC_OPTIONS = {
  dragging: false,
  touchZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  zoomControl: false,
  ctrlWheelZoom: false,
  fullscreenControl: false
}

// Click handlers are shared with Google maps and expect latLng.lat() / .lng().
function makeLatLng (lat, lng) {
  return { latLng: { lat: function () { return lat }, lng: function () { return lng } } }
}

require('../app').directive('sbLeafletMap', /* @ngInject */function () {
  return {
    templateUrl: '/views/directives/sbLeafletMap.html',
    scope: {
      center: '<',
      zoom: '<',
      poi: '<',
      onClick: '<',
      accuracy: '<',
      track: '<',
      zone: '<',
      zoneStyle: '<',
      box: '<',
      // A picture of the map: no controls, clicks go to the parent (e.g. a link).
      static: '<'
    },
    bindToController: true,
    controllerAs: '$ctrl',
    controller: /* @ngInject */function ($scope, $element) {
      const ctrl = this
      let map, marker, accuracyCircle, boxPolygon, trackLine, zonePolygon
      let mapEl, resizeObserver

      // For print: map.less scales the map down from its screen size, which
      // only script can measure. No size, no class, so it never prints blank.
      function recordScreenSize () {
        if (!mapEl.clientWidth || !mapEl.clientHeight) return
        mapEl.style.setProperty('--map-w', mapEl.clientWidth + 'px')
        mapEl.style.setProperty('--map-h', mapEl.clientHeight + 'px')
        mapEl.classList.add('is-print-scaled')
      }

      ctrl.$postLink = function () {
        mapEl = $element[0].querySelector('.sb-leaflet-map-container')
        map = leafletMap.createMap(mapEl, ctrl.center, ctrl.zoom, ctrl.static ? STATIC_OPTIONS : null)

        resizeObserver = leafletMap.observeSize(mapEl, map, recordScreenSize)

        map.on('click', function (e) {
          if (!ctrl.onClick) return
          $scope.$apply(function () {
            ctrl.onClick(null, null, null, [makeLatLng(e.latlng.lat, e.latlng.lng)])
          })
        })

        updateBox()
        updateTrack()
        updateZone()

        // poi changes in place, which $onChanges misses
        $scope.$watch(function () {
          const poi = ctrl.poi
          if (!poi) return null
          return poi.latitude + ',' + poi.longitude
        }, function () {
          updateMarker()
          updateAccuracy()
        })
      }

      ctrl.$onChanges = function (changes) {
        if (!map) return
        if (changes.center || changes.zoom) leafletMap.applyView(map, ctrl.center, ctrl.zoom)
        if (changes.accuracy) updateAccuracy()
        if (changes.box) updateBox()
        if (changes.track) updateTrack()
        if (changes.zone || changes.zoneStyle) updateZone()
      }

      ctrl.$onDestroy = function () {
        if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
        if (map) { map.remove(); map = null }
        mapEl = null
      }

      // [lat, lng] of the poi, or null
      function poiLatLng () {
        const poi = ctrl.poi
        if (!poi || poi.latitude == null || poi.longitude == null) return null
        return [poi.latitude, poi.longitude]
      }

      function updateMarker () {
        const latLng = poiLatLng()
        if (!latLng) {
          if (marker) { map.removeLayer(marker); marker = null }
        } else if (marker) {
          marker.setLatLng(latLng)
        } else {
          marker = leaflet.marker(latLng, { icon: leafletMap.markerIcon }).addTo(map)
        }
      }

      function updateAccuracy () {
        if (accuracyCircle) { map.removeLayer(accuracyCircle); accuracyCircle = null }
        const latLng = poiLatLng()
        if (!ctrl.accuracy || !latLng) return
        accuracyCircle = leaflet.circle(latLng, Object.assign({ radius: ctrl.accuracy }, mapStyles.ACCURACY)).addTo(map)
      }

      // Removes the old layer and returns the new one, or null if no points.
      function replaceOverlay (oldLayer, points, build) {
        if (oldLayer) map.removeLayer(oldLayer)
        const latLngs = leafletMap.toLatLngs(points)
        return latLngs ? build(latLngs).addTo(map) : null
      }

      function updateBox () {
        boxPolygon = replaceOverlay(boxPolygon, ctrl.box, function (latLngs) {
          return leaflet.polygon(latLngs, mapStyles.BOX)
        })
      }

      function updateTrack () {
        trackLine = replaceOverlay(trackLine, ctrl.track, function (latLngs) {
          return leaflet.polyline(latLngs, mapStyles.TRACK)
        })
      }

      function updateZone () {
        zonePolygon = replaceOverlay(zonePolygon, ctrl.zone, function (latLngs) {
          return leaflet.polygon(latLngs, Object.assign({}, mapStyles.ZONE, ctrl.zoneStyle, { interactive: false }))
        })
      }
    }
  }
})
