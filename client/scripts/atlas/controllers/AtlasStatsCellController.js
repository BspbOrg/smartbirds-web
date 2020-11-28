var utils = require('../utils')

var BaseMapController = require('./BaseMapController')

module.exports = /* @ngInject */function AtlasStatsCellController (api, ngToast, $translate) {
  var $ctrl = this

  BaseMapController.apply(this)

  $ctrl.cells = []

  api.bgatlas2008.globalCellStats()
    .then(function (cells) {
      $ctrl.cells = cells.map(function (cell) {
        return utils.mapCellToMapModel(cell)
      })
    })

  $ctrl.selected = null
  $ctrl.loading = false
  $ctrl.rows = []
  $ctrl.species = 0
  var lastCellInfoRequest = null
  function setSelectedCell (utmCode, model) {
    // unselect on second select
    if ($ctrl.selected === utmCode) {
      utmCode = null
    }

    if (lastCellInfoRequest) {
      lastCellInfoRequest.cancel()
      lastCellInfoRequest = null
    }
    if (model) {
      utils.updateModelStyle(model, !!utmCode)
    }
    $ctrl.selected = utmCode || null
    $ctrl.rows = []
    $ctrl.species = 0
    $ctrl.loading = !!utmCode
    if (!utmCode) return

    var call = lastCellInfoRequest = api.bgatlas2008.getCellStats(utmCode)
    call
      .then(function (row) {
        console.log(row)
        if ($ctrl.selected === utmCode) {
          $ctrl.rows = row
          $ctrl.species = row.$$response.count
        }
        console.log($ctrl)
      })
      .catch(function (error) {
        if (error && error.status !== -1) {
          ngToast.create({
            className: 'danger',
            content: '<p>' + $translate.instant('Error while loading') + '</p><pre>' + (error.data ? error.data.error : JSON.stringify(error, null, 2)) + '</pre>'
          })
        }
      })
      .finally(function () {
        if ($ctrl.selected === utmCode) {
          $ctrl.loading = false
        }
        if (call === lastCellInfoRequest) {
          lastCellInfoRequest = null
        }
      })
  }

  $ctrl.events = {
    click: function (poly, event, model) {
      setSelectedCell(model.cell.utm_code, model)
    }
  }
}
