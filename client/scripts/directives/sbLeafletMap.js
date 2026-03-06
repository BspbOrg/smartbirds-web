const leaflet = require('leaflet')

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

// Wrap plain {lat, lng} values into the Google Maps-style latLng object the controller's click handler expects
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

      ctrl.$postLink = function () {
        const mapEl = $element[0].querySelector('.sb-leaflet-map-container')
        const initialCenter = ctrl.center ? [ctrl.center.latitude, ctrl.center.longitude] : [42.765833, 25.238611]
        const tileLayerOptions = {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }

        const mapOptions = { scrollWheelZoom: false }

        map = leaflet.map(mapEl, mapOptions).setView(initialCenter, ctrl.zoom || 8)
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', tileLayerOptions).addTo(map)

        mapEl.addEventListener('wheel', function (e) {
          if (!e.ctrlKey) return
          e.preventDefault()
          if (e.deltaY < 0) { map.zoomIn() } else { map.zoomOut() }
        }, { passive: false })

        map.on('click', function (e) {
          if (!ctrl.onClick) return
          $scope.$apply(function () {
            ctrl.onClick(null, null, null, [makeLatLng(e.latlng.lat, e.latlng.lng)])
          })
        })

        // poi is mutated in place by updateFromModel so $onChanges won't fire for it
        $scope.$watch(function () { return ctrl.poi }, function (poi) {
          if (!poi) return
          updateMarker(poi.latitude, poi.longitude)
          updateAccuracy(ctrl.accuracy)
        }, true)
      }

      ctrl.$onChanges = function (changes) {
        if (!map) return
        if (changes.center || changes.zoom) {
          const lat = ctrl.center && ctrl.center.latitude
          const lng = ctrl.center && ctrl.center.longitude
          const z = ctrl.zoom
          if (!z) return
          if (lat && lng) {
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
        if (map) map.remove()
      }

      function updateMarker (lat, lng) {
        if (!map) return
        if (!lat || !lng) {
          if (marker) { map.removeLayer(marker); marker = null }
          return
        }
        const latLng = [lat, lng]
        if (marker) {
          marker.setLatLng(latLng)
        } else {
          marker = leaflet.marker(latLng, { draggable: true, icon: markerIcon }).addTo(map)
          marker.on('dragend', function (e) {
            $scope.$apply(function () {
              const pos = e.target.getLatLng()
              if (!ctrl.onClick) return
              ctrl.onClick(null, null, null, [makeLatLng(pos.lat, pos.lng)])
            })
          })
        }
      }

      function updateAccuracy (accuracy) {
        if (!map) return
        if (accuracyCircle) { map.removeLayer(accuracyCircle); accuracyCircle = null }
        const poi = ctrl.poi
        if (!accuracy || !poi || !poi.latitude || !poi.longitude) return
        accuracyCircle = leaflet.circle([poi.latitude, poi.longitude], {
          radius: accuracy,
          color: '#f00',
          fillColor: '#f00',
          fillOpacity: 0.3,
          weight: 1
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
          weight: 3
        }).addTo(map)
      }
    }
  }
})
