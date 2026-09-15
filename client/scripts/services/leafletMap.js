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

module.exports = { DEFAULT_CENTER, DEFAULT_ZOOM, createTileLayer, observeSize }
