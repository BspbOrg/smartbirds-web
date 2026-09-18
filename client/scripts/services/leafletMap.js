/* global ResizeObserver */
const leaflet = require('leaflet')

const DEFAULT_CENTER = { latitude: 42.744820608, longitude: 25.2151370694 }
const DEFAULT_ZOOM = 8

const TILES_URL = process.env.TILES_URL || 'https://tiles.smartbirds.org/{z}/{x}/{y}.png'

function createTileLayer (options) {
  return leaflet.tileLayer(TILES_URL, Object.assign({
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }, options))
}

function observeSize (element, map) {
  if (typeof ResizeObserver === 'undefined') return null
  const observer = new ResizeObserver(function () {
    map.invalidateSize()
  })
  observer.observe(element)
  return observer
}

function numberOr (value, fallback) {
  return typeof value === 'number' && isFinite(value) ? value : fallback
}

// Maps a model's {fill, stroke} objects onto Leaflet path options.
//
// Every value is coerced, because a non-numeric opacity would otherwise land in
// an SVG attribute and render unpredictably. Missing values fall back to fully
// opaque rather than to Leaflet's own softer defaults, so an incomplete model is
// conspicuous instead of quietly looking plausible. No screen relies on this —
// they all supply real numbers.
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

module.exports = { DEFAULT_CENTER, DEFAULT_ZOOM, createTileLayer, observeSize, translateStyle }
