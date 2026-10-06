const angular = require('angular')
const leaflet = require('leaflet')
require('leaflet.markercluster')
const leafletMap = require('../services/leafletMap')

// Callers clear with {} instead of [], so a non-array means empty.
function toArray (models) {
  return Array.isArray(models) ? models : []
}

require('../app').directive('sbLeafletCollectionMap', /* @ngInject */function () {
  return {
    templateUrl: '/views/directives/sbLeafletMap.html',
    // Optional popup markup. Each open popup gets the layer's model as $model.
    transclude: {
      markerPopup: '?markerPopup',
      polygonPopup: '?polygonPopup'
    },
    scope: {
      center: '<',
      zoom: '<',
      markers: '<',
      // Markers cluster unless this is false. Read once.
      cluster: '<?',
      control: '<',
      onClick: '<',
      polygons: '<',
      maxZoom: '<',
      onPolygonClick: '<',
      // Leaflet path options for all polygons. Default: each model's fill/stroke.
      polygonStyle: '<',
      // From this zoom on, polygons replace markers.
      polygonMinZoom: '<',
      // Models with a `path` of {latitude, longitude}. Not clickable, not in the fit.
      polylines: '<',
      polylineStyle: '<',
      // (marker, 'popupclose', model), however the popup was closed.
      onPopupClose: '<'
    },
    bindToController: true,
    controllerAs: '$ctrl',
    controller: /* @ngInject */function ($scope, $element, $timeout, $transclude) {
      const ctrl = this
      let map, markerLayer, polygonLayer, polylineLayer
      let mapEl, resizeObserver, fitTimer
      // model -> {layer, signature}. Callers change models in place.
      let polygonEntries = new Map()
      // Bounds to fit once the container has a size (e.g. in a hidden tab).
      let pendingBounds

      ctrl.$postLink = function () {
        mapEl = $element[0].querySelector('.sb-leaflet-map-container')
        // maxZoom on the map limits how far the user can zoom.
        map = leafletMap.createMap(mapEl, ctrl.center, ctrl.zoom, ctrl.maxZoom != null ? { maxZoom: ctrl.maxZoom } : null)

        // A fit made while the container had no size is wrong, so redo it.
        resizeObserver = leafletMap.observeSize(mapEl, map, function () {
          if (!pendingBounds || !hasSize()) return
          const bounds = pendingBounds
          pendingBounds = null
          map.fitBounds(bounds)
        })

        markerLayer = ctrl.cluster === false
          ? leaflet.layerGroup()
          : leaflet.markerClusterGroup({ showCoverageOnHover: false })
        markerLayer.addTo(map)

        // Polylines are added after polygons so they draw on top.
        polygonLayer = leaflet.layerGroup()
        polygonLayer.addTo(map)
        polylineLayer = leaflet.layerGroup()
        polylineLayer.addTo(map)

        showLayersForZoom()
        map.on('zoomend', showLayersForZoom)

        // The caller keeps a reference to this object, so add to it, don't replace it.
        if (ctrl.control && typeof ctrl.control === 'object') {
          ctrl.control.newModels = function (models) {
            // Full rebuild. With no args it re-reads the binding.
            if (arguments.length) ctrl.markers = models
            setMarkers(ctrl.markers)
          }
        }

        setMarkers(ctrl.markers)
        setPolygons(ctrl.polygons)
        setPolylines(ctrl.polylines)
      }

      // Callers restyle by changing model.fill / model.stroke in place, which
      // $onChanges misses. One watcher on a joined string catches it cheaply.
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
          entry.layer.setStyle(polygonStyleOf(model))
        })
      })

      ctrl.$onChanges = function (changes) {
        if (!map) return
        if (changes.center || changes.zoom) leafletMap.applyView(map, ctrl.center, ctrl.zoom)
        if (changes.markers) setMarkers(ctrl.markers)
        if (changes.polygons) setPolygons(ctrl.polygons)
        if (changes.polylines) setPolylines(ctrl.polylines)
        if (changes.polygonMinZoom) showLayersForZoom()
      }

      ctrl.$onDestroy = function () {
        if (fitTimer) { $timeout.cancel(fitTimer); fitTimer = null }
        pendingBounds = null
        if (ctrl.control && typeof ctrl.control === 'object') delete ctrl.control.newModels
        if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
        if (markerLayer) { markerLayer.clearLayers(); markerLayer = null }
        if (polygonLayer) { polygonLayer.clearLayers(); polygonLayer = null }
        if (polylineLayer) { polylineLayer.clearLayers(); polylineLayer = null }
        polygonEntries = new Map()
        if (map) { map.remove(); map = null }
        mapEl = null
      }

      function setMarkers (models) {
        if (!map || !markerLayer) return
        markerLayer.clearLayers()

        const built = []
        toArray(models).forEach(function (model) {
          if (!model) return
          // == null, not falsy: 0 is a valid coordinate.
          if (model.latitude == null || model.longitude == null) return
          const marker = leaflet.marker([model.latitude, model.longitude], { icon: leafletMap.markerIcon })
          if ($transclude.isSlotFilled('markerPopup')) {
            bindPopup(marker, model, 'markerPopup', function () {
              // $evalAsync: this can fire inside a digest. No map means $onDestroy.
              $scope.$evalAsync(function () {
                if (map && ctrl.onPopupClose) ctrl.onPopupClose(marker, 'popupclose', model)
              })
            })
          }
          marker.on('click', function () {
            if (!ctrl.onClick) return
            $scope.$apply(function () {
              ctrl.onClick(marker, 'click', model)
            })
          })
          built.push(marker)
        })

        // Only the cluster group has the fast bulk addLayers.
        if (markerLayer.addLayers) {
          markerLayer.addLayers(built)
        } else {
          built.forEach(function (marker) { markerLayer.addLayer(marker) })
        }

        fitToContent()
      }

      // Content is built when the popup opens, so only the open popup has a
      // scope. Angular renders it, so values are escaped.
      function bindPopup (layer, model, slot, onClose) {
        let popupScope, popupEl, sizeObserver
        layer.bindPopup(function () {
          // Leaflet calls this on every popup.update(); reuse the open content.
          if (popupEl) return popupEl
          popupEl = document.createElement('div')
          $transclude(function (clone, scope) {
            popupScope = scope
            popupScope.$model = model
            angular.element(popupEl).append(clone)
          }, null, slot)
          // Render now: Leaflet measures the content right after this.
          popupScope.$digest()
          // Re-layout when late content (e.g. an ng-include) changes the size.
          if (window.ResizeObserver) {
            sizeObserver = new window.ResizeObserver(function () {
              if (layer.isPopupOpen()) layer.getPopup().update()
            })
            sizeObserver.observe(popupEl)
          }
          return popupEl
        })
        // Also fires when the layer is removed, so no other cleanup is needed.
        layer.on('popupclose', function () {
          if (sizeObserver) sizeObserver.disconnect()
          if (popupScope) popupScope.$destroy()
          if (popupEl) angular.element(popupEl).remove()
          popupScope = popupEl = sizeObserver = null
          if (onClose) onClose()
        })
      }

      // Hides layers without clearing them, so the fit still covers both.
      function showLayersForZoom () {
        if (!map) return
        const min = ctrl.polygonMinZoom
        const zoom = map.getZoom()
        showLayer(markerLayer, min == null || zoom < min)
        showLayer(polygonLayer, min == null || zoom >= min)
      }

      function showLayer (layer, show) {
        if (show && !map.hasLayer(layer)) map.addLayer(layer)
        if (!show && map.hasLayer(layer)) map.removeLayer(layer)
      }

      function polygonStyleOf (model) {
        return ctrl.polygonStyle || leafletMap.translateStyle(model)
      }

      // Everything translateStyle reads, as one string for the watcher.
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
          const latLngs = leafletMap.toLatLngs(model.coordinates)
          if (!latLngs) return
          const polygon = leaflet.polygon(latLngs, polygonStyleOf(model))
          if ($transclude.isSlotFilled('polygonPopup')) bindPopup(polygon, model, 'polygonPopup')
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

      function setPolylines (models) {
        if (!map || !polylineLayer) return
        polylineLayer.clearLayers()
        const style = Object.assign({}, ctrl.polylineStyle, { interactive: false })
        toArray(models).forEach(function (model) {
          const latLngs = leafletMap.toLatLngs(model && model.path)
          if (latLngs) polylineLayer.addLayer(leaflet.polyline(latLngs, style))
        })
      }

      // Fits to markers and polygons. With no content the view stays put.
      function fitToContent () {
        if (!map) return

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
        // Wait for layout, so the container has its height.
        if (fitTimer) $timeout.cancel(fitTimer)
        fitTimer = $timeout(function () {
          fitTimer = null
          if (!map) return
          map.invalidateSize()
          if (!hasSize()) {
            // Not laid out yet; the resize callback fits later.
            pendingBounds = bounds
            return
          }
          pendingBounds = null
          map.fitBounds(bounds)
        })
      }

      function hasSize () {
        const size = map.getSize()
        return size.x >= 1 && size.y >= 1
      }
    }
  }
})
