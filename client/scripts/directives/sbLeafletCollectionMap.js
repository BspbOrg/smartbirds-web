const leaflet = require('leaflet')
require('leaflet-fullscreen')
require('leaflet.markercluster')
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

// ui-gmap tolerated a non-array models value — the list map passes {} when it
// clears — and iterating an object yielded nothing. Match that.
function toArray (models) {
  return Array.isArray(models) ? models : []
}

require('../app').directive('sbLeafletCollectionMap', /* @ngInject */function () {
  return {
    templateUrl: '/views/directives/sbLeafletCollectionMap.html',
    scope: {
      center: '<',
      zoom: '<',
      markers: '<',
      cluster: '<',
      fit: '<',
      control: '<',
      onClick: '<',
      polygons: '<',
      maxZoom: '<',
      onPolygonClick: '<'
    },
    bindToController: true,
    controllerAs: '$ctrl',
    controller: /* @ngInject */function ($scope, $element, $timeout) {
      const ctrl = this
      let map, markerLayer, polygonLayer
      let mapEl, resizeObserver, refitObserver, fitTimer
      // model -> {layer, signature}. Keyed by model identity because callers
      // mutate models in place rather than replacing them.
      let polygonEntries = new Map()
      // Bounds of the last fit, kept so a map fitted while its container was
      // unsized (hidden tab, unresolved height) can re-fit once size arrives.
      let pendingBounds

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
        // On the map rather than the tile layer: this caps interaction, which is
        // what callers previously got from Google's options.maxZoom.
        if (ctrl.maxZoom != null) mapOptions.maxZoom = ctrl.maxZoom

        map = leaflet.map(mapEl, mapOptions).setView(initialCenter, ctrl.zoom || leafletMap.DEFAULT_ZOOM)
        map.attributionControl.setPrefix(false)
        leafletMap.createTileLayer().addTo(map)
        map.addControl(new leaflet.Control.Fullscreen({ position: 'topright' }))

        // Leaflet paints grey tiles if the container resizes while hidden.
        // observeSize handles invalidateSize; re-fitting is this directive's job,
        // because a fit computed against a zero-height box leaves the viewport
        // permanently wrong even after the tiles come back.
        resizeObserver = leafletMap.observeSize(mapEl, map)
        // observeSize returns null where ResizeObserver is missing, so a non-null
        // result is what makes the constructor below safe to call.
        if (resizeObserver) {
          refitObserver = new window.ResizeObserver(function () {
            if (!map || !pendingBounds) return
            const size = map.getSize()
            if (size.x < 1 || size.y < 1) return
            const bounds = pendingBounds
            pendingBounds = null
            map.invalidateSize()
            map.fitBounds(bounds)
          })
          refitObserver.observe(mapEl)
        }

        // Custom Ctrl+scroll zoom that zooms to mouse cursor
        mapEl.addEventListener('wheel', onWheel, { passive: false })

        markerLayer = ctrl.cluster ? leaflet.markerClusterGroup() : leaflet.layerGroup()
        markerLayer.addTo(map)

        polygonLayer = leaflet.layerGroup()
        polygonLayer.addTo(map)

        // The control object arrives as a bare {} and the consumer keeps its
        // reference, so assign onto it rather than replacing it. Populated here so
        // the consumer's first refresh finds newModels already a function.
        if (ctrl.control && typeof ctrl.control === 'object') {
          ctrl.control.newModels = function (models) {
            // ui-gmap's newModels was a full rebuild, not an incremental update,
            // so replace the set wholesale. Called with no args it re-reads the
            // binding, keeping one path into setMarkers.
            if (arguments.length) ctrl.markers = models
            setMarkers(ctrl.markers)
          }
        }

        setMarkers(ctrl.markers)
        setPolygons(ctrl.polygons)
      }

      // Callers restyle by mutating model.fill / model.stroke in place, so no
      // binding reference changes and $onChanges never fires. ui-gmap used four
      // $watches per polygon; one watch over a joined signature does the same at
      // a fraction of the digest cost.
      $scope.$watch(function () {
        if (!polygonEntries.size) return ''
        const parts = []
        polygonEntries.forEach(function (entry, model) {
          parts.push(signatureOf(model))
        })
        return parts.join('~')
      }, function (newValue, oldValue) {
        if (newValue === oldValue) return
        polygonEntries.forEach(function (entry, model) {
          const signature = signatureOf(model)
          if (signature === entry.signature) return
          entry.signature = signature
          entry.layer.setStyle(leafletMap.translateStyle(model))
        })
      })

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
        if (changes.markers) setMarkers(ctrl.markers)
        if (changes.polygons) setPolygons(ctrl.polygons)
      }

      ctrl.$onDestroy = function () {
        if (fitTimer) { $timeout.cancel(fitTimer); fitTimer = null }
        pendingBounds = null
        if (ctrl.control && typeof ctrl.control === 'object') delete ctrl.control.newModels
        if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
        if (refitObserver) { refitObserver.disconnect(); refitObserver = null }
        if (mapEl) { mapEl.removeEventListener('wheel', onWheel); mapEl = null }
        if (markerLayer) { markerLayer.clearLayers(); markerLayer = null }
        if (polygonLayer) { polygonLayer.clearLayers(); polygonLayer = null }
        polygonEntries = new Map()
        if (map) { map.remove(); map = null }
      }

      function setMarkers (models) {
        if (!map || !markerLayer) return
        markerLayer.clearLayers()

        const built = []
        toArray(models).forEach(function (model) {
          if (!model) return
          // == null, not falsy: a real coordinate of 0 must render. ui-gmap skipped
          // such models silently too.
          if (model.latitude == null || model.longitude == null) return
          const marker = leaflet.marker([model.latitude, model.longitude], { icon: markerIcon })
          marker.on('click', function () {
            if (!ctrl.onClick) return
            $scope.$apply(function () {
              ctrl.onClick(marker, 'click', model)
            })
          })
          built.push(marker)
        })

        // addLayers is markercluster's chunked bulk path; plain LayerGroup has no
        // such method, so fall back to adding one at a time.
        if (markerLayer.addLayers) {
          markerLayer.addLayers(built)
        } else {
          built.forEach(function (marker) { markerLayer.addLayer(marker) })
        }

        fitToContent()
      }

      function pathOf (model) {
        const points = model && model.coordinates
        if (!Array.isArray(points)) return null
        const latLngs = []
        for (let i = 0; i < points.length; i++) {
          const point = points[i]
          // == null, not falsy: a real coordinate of 0 must render. Same rule as
          // setMarkers, and as ui-gmap's own coordinate validation.
          if (!point || point.latitude == null || point.longitude == null) return null
          latLngs.push([point.latitude, point.longitude])
        }
        return latLngs.length ? latLngs : null
      }

      // Everything translateStyle reads, as one string, so the watch above can
      // diff without a deep copy of every model each digest.
      function signatureOf (model) {
        const fill = model.fill || {}
        const stroke = model.stroke || {}
        return fill.color + '|' + fill.opacity + '|' +
          stroke.color + '|' + stroke.opacity + '|' + stroke.weight
      }

      function setPolygons (models) {
        if (!map || !polygonLayer) return
        polygonLayer.clearLayers()
        polygonEntries = new Map()

        toArray(models).forEach(function (model) {
          if (!model) return
          const latLngs = pathOf(model)
          if (!latLngs) return
          const polygon = leaflet.polygon(latLngs, leafletMap.translateStyle(model))
          polygon.on('click', function () {
            if (!ctrl.onPolygonClick) return
            $scope.$apply(function () {
              ctrl.onPolygonClick(polygon, 'click', model)
            })
          })
          polygonLayer.addLayer(polygon)
          polygonEntries.set(model, { layer: polygon, signature: signatureOf(model) })
        })

        fitToContent()
      }

      // ui-gmap re-fits on every change and no-ops on an empty set, so a clear()
      // leaves the viewport alone. Kept deliberately, to match current behaviour.
      function fitToContent () {
        if (!ctrl.fit || !map) return

        const latLngs = []
        if (markerLayer) {
          markerLayer.eachLayer(function (layer) {
            if (layer.getLatLng) latLngs.push(layer.getLatLng())
          })
        }
        if (polygonLayer) {
          polygonLayer.eachLayer(function (layer) {
            if (!layer.getLatLngs) return
            const ring = layer.getLatLngs()[0] || []
            ring.forEach(function (latLng) { latLngs.push(latLng) })
          })
        }
        if (!latLngs.length) return

        const bounds = leaflet.latLngBounds(latLngs)
        // Deferred past the digest so layout exists: fitBounds against a container
        // whose height has not resolved computes a wrong zoom. ui-gmap's FitHelper
        // defers for the same reason.
        if (fitTimer) $timeout.cancel(fitTimer)
        fitTimer = $timeout(function () {
          fitTimer = null
          if (!map) return
          map.invalidateSize()
          const size = map.getSize()
          if (size.x < 1 || size.y < 1) {
            // Container not laid out yet; refitObserver retries once it is.
            pendingBounds = bounds
            return
          }
          pendingBounds = null
          map.fitBounds(bounds)
        })
      }
    }
  }
})
