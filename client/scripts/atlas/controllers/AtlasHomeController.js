var utils = require('../utils')

var BaseMapController = require('./BaseMapController')

module.exports = /* @ngInject */function AtlasHomeController (api) {
  var $ctrl = this

  BaseMapController.apply(this)

  $ctrl.cells = []

  api.bgatlas2008.globalCellStats()
    .then(function (cells) {
      $ctrl.cells = cells.map(function (cell) {
        return utils.mapCellToMapModel(cell)
      })
    })
}
