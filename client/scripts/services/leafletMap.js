/* global ResizeObserver */
const leaflet = require('leaflet')
require('leaflet-fullscreen')

const DEFAULT_CENTER = { latitude: 42.744820608, longitude: 25.2151370694 }
const DEFAULT_ZOOM = 8

const TILES_URL = process.env.TILES_URL || 'https://tiles.smartbirds.org/{z}/{x}/{y}.png'

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

// Ctrl+wheel zooms at the cursor; a plain wheel scrolls the page.
// map.remove() turns the handler off, so no cleanup is needed.
const CtrlWheelZoom = leaflet.Handler.extend({
  addHooks: function () {
    leaflet.DomEvent.on(this._map.getContainer(), 'wheel', this._onWheel, this)
  },
  removeHooks: function () {
    leaflet.DomEvent.off(this._map.getContainer(), 'wheel', this._onWheel, this)
  },
  _onWheel: function (e) {
    if (!e.ctrlKey) return
    leaflet.DomEvent.stop(e)
    const map = this._map
    const delta = e.deltaY < 0 ? 1 : -1
    map.setZoomAround(map.mouseEventToLatLng(e), map.getZoom() + delta, { animate: true })
  }
})
leaflet.Map.addInitHook('addHandler', 'ctrlWheelZoom', CtrlWheelZoom)

function createTileLayer (options) {
  return leaflet.tileLayer(TILES_URL, Object.assign({
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }, options))
}

// OSM tiles, fullscreen button, Ctrl+wheel zoom. `options` go to leaflet.map.
function createMap (element, center, zoom, options) {
  center = center || DEFAULT_CENTER
  const map = leaflet.map(element, Object.assign({
    scrollWheelZoom: false,
    ctrlWheelZoom: true,
    fullscreenControl: { position: 'topright' }
  }, options)).setView([center.latitude, center.longitude], zoom || DEFAULT_ZOOM)
  map.attributionControl.setPrefix(false)
  createTileLayer().addTo(map)
  return map
}

// A center without coordinates only changes the zoom.
function applyView (map, center, zoom) {
  zoom = zoom || map.getZoom()
  if (center && center.latitude != null && center.longitude != null) {
    map.setView([center.latitude, center.longitude], zoom)
  } else {
    map.setZoom(zoom)
  }
}

// {latitude, longitude} points to [lat, lng] pairs, or null if nothing to draw.
function toLatLngs (points) {
  if (!Array.isArray(points)) return null
  const latLngs = []
  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    // == null, not falsy: 0 is a valid coordinate. One bad point drops the
    // whole shape, because a partial shape would be misleading.
    if (!point || point.latitude == null || point.longitude == null) return null
    latLngs.push([point.latitude, point.longitude])
  }
  return latLngs.length ? latLngs : null
}

// onResize, when given, runs after each invalidateSize
function observeSize (element, map, onResize) {
  if (typeof ResizeObserver === 'undefined') return null
  const observer = new ResizeObserver(function () {
    map.invalidateSize()
    if (onResize) onResize()
  })
  observer.observe(element)
  return observer
}

function numberOr (value, fallback) {
  return typeof value === 'number' && isFinite(value) ? value : fallback
}

// A model's {fill, stroke} to Leaflet path options. Bad or missing numbers
// become 1, so a broken model is easy to spot.
function translateStyle (model) {
  const fill = (model && model.fill) || {}
  const stroke = (model && model.stroke) || {}
  return {
    color: stroke.color,
    weight: numberOr(stroke.weight, 1),
    opacity: numberOr(stroke.opacity, 1),
    fillColor: fill.color,
    fillOpacity: numberOr(fill.opacity, 1)
  }
}

module.exports = {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  markerIcon,
  createTileLayer,
  createMap,
  applyView,
  toLatLngs,
  observeSize,
  translateStyle
}
