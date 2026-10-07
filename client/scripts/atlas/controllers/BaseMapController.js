const leafletMap = require('../../services/leafletMap')
const utils = require('../utils')

module.exports = function BaseMapController () {
  const $ctrl = this

  $ctrl.map = {
    state: {
      center: leafletMap.DEFAULT_CENTER,
      zoom: utils.defaultZoom
    },
    options: {
      maxZoom: 15
    }
  }

  // polygon-style-fn for the maps that select cells
  $ctrl.cellStyle = utils.cellStyle
}
