const leaflet = require('leaflet')
require('leaflet-fullscreen')
const leafletMap = require('../services/leafletMap')

const markerIcon = leaflet.divIcon({
  html: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">' +
    '<path d="M12 0C5.373 0 0 5.373 0 12c0 8.3 12 24 12 24s12-15.7 12-24C24 5.373 18.627 0 12 0z" fill="#EA4335"/>' +
    '<circle cx="12" cy="12" r="5" fill="white"/>' +
    '</svg>',
  className: '',
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36]
})

// Click handlers read coordinates as latLng.lat() / .lng(), so wrap plain numbers
// in that accessor shape rather than making every caller change.
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
      zone: '<'
    },
    bindToController: true,
    controllerAs: '$ctrl',
    controller: /* @ngInject */function ($scope, $element) {
      const ctrl = this
      let map, marker, accuracyCircle, trackLine, zonePolygon
      let mapEl, resizeObserver

      // Named so $onDestroy can remove the listener again
      function onWheel (e) {
        if (!e.ctrlKey) return
        e.preventDefault()
        e.stopPropagation()
        const containerPoint = map.mouseEventToContainerPoint(e)
        const latLng = map.containerPointToLatLng(containerPoint)
        const delta = e.deltaY < 0 ? 1 : -1
        map.setZoomAround(latLng, map.getZoom() + delta, { animate: true })
      }

      ctrl.$postLink = function () {
        mapEl = $element[0].querySelector('.sb-leaflet-map-container')
        const center = ctrl.center || leafletMap.DEFAULT_CENTER
        const initialCenter = [center.latitude, center.longitude]

        const mapOptions = {
          scrollWheelZoom: false,
          attributionControl: true
        }

        map = leaflet.map(mapEl, mapOptions).setView(initialCenter, ctrl.zoom || leafletMap.DEFAULT_ZOOM)
        map.attributionControl.setPrefix(false)
        leafletMap.createTileLayer().addTo(map)
        map.addControl(new leaflet.Control.Fullscreen({ position: 'topright' }))

        // Leaflet paints grey tiles if the container resizes while hidden
        resizeObserver = leafletMap.observeSize(mapEl, map)

        // Custom Ctrl+scroll zoom that zooms to mouse cursor
        // Uses Leaflet's setZoomAround for zoom-to-cursor behavior
        mapEl.addEventListener('wheel', onWheel, { passive: false })

        map.on('click', function (e) {
          if (!ctrl.onClick) return
          $scope.$apply(function () {
            ctrl.onClick(null, null, null, [makeLatLng(e.latlng.lat, e.latlng.lng)])
          })
        })

        updateTrack(ctrl.track)
        updateZone(ctrl.zone)

        // poi is mutated in place by updateFromModel so $onChanges won't fire for it
        $scope.$watch(function () {
          const poi = ctrl.poi
          if (!poi) return null
          return poi.latitude + ',' + poi.longitude
        }, function (key) {
          if (key === null) return
          updateMarker(ctrl.poi.latitude, ctrl.poi.longitude)
          updateAccuracy(ctrl.accuracy)
        })
      }

      ctrl.$onChanges = function (changes) {
        if (!map) return
        if (changes.center || changes.zoom) {
          const lat = ctrl.center && ctrl.center.latitude
          const lng = ctrl.center && ctrl.center.longitude
          const z = ctrl.zoom || map.getZoom()
          if (lat != null && lng != null) {
            map.setView([lat, lng], z)
          } else {
            map.setZoom(z)
          }
        }
        if (changes.accuracy) updateAccuracy(ctrl.accuracy)
        if (changes.track) updateTrack(ctrl.track)
        if (changes.zone) updateZone(ctrl.zone)
      }

      ctrl.$onDestroy = function () {
        if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
        if (mapEl) { mapEl.removeEventListener('wheel', onWheel); mapEl = null }
        if (map) { map.remove(); map = null }
      }

      function updateMarker (lat, lng) {
        if (!map) return
        if (lat == null || lng == null) {
          if (marker) { map.removeLayer(marker); marker = null }
          return
        }
        const latLng = [lat, lng]
        if (marker) {
          marker.setLatLng(latLng)
        } else {
          marker = leaflet.marker(latLng, { icon: markerIcon }).addTo(map)
        }
      }

      function updateAccuracy (accuracy) {
        if (!map) return
        if (accuracyCircle) { map.removeLayer(accuracyCircle); accuracyCircle = null }
        const poi = ctrl.poi
        if (!accuracy || !poi || poi.latitude == null || poi.longitude == null) return
        accuracyCircle = leaflet.circle([poi.latitude, poi.longitude], {
          radius: accuracy,
          color: '#f00',
          fillColor: '#f00',
          fillOpacity: 0.3,
          weight: 1,
          interactive: false
        }).addTo(map)
      }

      function updateTrack (track) {
        if (!map) return
        if (trackLine) { map.removeLayer(trackLine); trackLine = null }
        if (!track || !track.length) return
        const points = track.map(function (p) { return [p.latitude, p.longitude] })
        trackLine = leaflet.polyline(points, { color: '#36c', weight: 3 }).addTo(map)
      }

      function updateZone (zone) {
        if (!map) return
        if (zonePolygon) { map.removeLayer(zonePolygon); zonePolygon = null }
        if (!zone || !zone.length) return
        const points = zone.map(function (p) { return [p.latitude, p.longitude] })
        zonePolygon = leaflet.polygon(points, {
          color: '#00f',
          fillOpacity: 0.7,
          weight: 3,
          interactive: false
        }).addTo(map)
      }
    }
  }
})
