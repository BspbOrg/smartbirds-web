// Leaflet path options for the map overlays

// sbLeafletMap and listMap
const TRACK = { color: '#36c', weight: 3 }

module.exports = {
  // sbLeafletMap: GPS accuracy circle
  ACCURACY: { color: '#f00', fillColor: '#f00', fillOpacity: 0.3, weight: 1, interactive: false },
  // sbLeafletMap: location filter box
  BOX: { color: '#3c3', opacity: 0.8, weight: 1, fillColor: '#3c3', fillOpacity: 0.3, interactive: false },
  TRACK,
  // sbLeafletMap: default for `zone`, `zone-style` overrides it
  ZONE: { color: '#00f', fillOpacity: 0.7, weight: 3 },
  // listMap: CBM zones
  LIST_ZONE: { color: '#c33', opacity: 0.7, weight: 0.5, fillColor: '#c33', fillOpacity: 0.4 }
}
