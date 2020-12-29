var utils = require('../utils')

module.exports = function BaseMapController () {
  var $ctrl = this

  $ctrl.map = {
    state: {
      bounds: utils.defaultBounds,
      center: utils.defaultCenter,
      dragging: false,
      zoom: utils.defaultZoom
    },
    options: {
      maxZoom: 15
    }
  }
}
