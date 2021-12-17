const utils = require('../utils')

const BaseExtendedMapController = require('./BaseExtendedMapController')

module.exports = /* @ngInject */function AtlasNewSpeciesController (api, ngToast, $translate) {
  const $ctrl = this

  $ctrl.selectable = true
  BaseExtendedMapController.apply(this, [ngToast, $translate])

  api.bgatlas2008.globalCellStats()
    .then(function (cells) {
      $ctrl.cells = cells.map(function (cell) {
        return utils.mapCellToMapModel(cell)
      })
    })

  $ctrl.loadCellInfo = function (model) {
    return api.bgatlas2008.getCellInfo(model.cell.utm_code)
      .then(function (rows) {
        return rows.filter(function (row) {
          return !row.known && (row.other || row.observed)
        })
      })
  }
}
