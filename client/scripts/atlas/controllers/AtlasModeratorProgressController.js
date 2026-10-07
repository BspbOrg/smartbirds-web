const utils = require('../utils')

const BaseExtendedMapController = require('./BaseExtendedMapController')

module.exports = /* @ngInject */function AtlasModeratorProgressController (api, ngToast, $state, $translate) {
  const $ctrl = this

  $ctrl.selectable = true
  BaseExtendedMapController.apply(this, [ngToast, $translate])

  $ctrl.colors = utils.colors
  $ctrl.colors.vhigh = '#31c1f1'

  // This page has its own colour scale for unselected cells
  $ctrl.cellStyle = function (model, selected) {
    if (selected) return utils.cellStyle(model, true)

    let color
    if (model.completed) {
      color = utils.colors.completed
    } else if (model.percent <= 40) {
      color = utils.colors.low
    } else if (model.percent <= 70) {
      color = utils.colors.med
    } else if (model.percent <= 90) {
      color = utils.colors.high
    } else {
      color = $ctrl.colors.vhigh
    }
    return {
      fill: { color, opacity: utils.unselectedOpacityFill() },
      stroke: { color, opacity: 0.4, weight: 1 }
    }
  }

  api.bgatlas2008.globalCellStats().then(function (cells) {
    $ctrl.cells = cells.map(function (cell) {
      return utils.mapCellToMapModel(cell)
    })
  })

  $ctrl.loadCellInfo = function (model) {
    return Promise.all([
      api.bgatlas2008.moderatorCellMethodology(model.id),
      api.bgatlas2008.moderatorCellUsers(model.id),
      api.bgatlas2008.cellStatus(model.id)
    ]).then(function (data) {
      return {
        methodology: data[0],
        users: data[1],
        status: data[2]
      }
    })
  }

  $ctrl.updateStatus = function (model, status) {
    api.bgatlas2008.setCellStatus(model.id, status)
      .then(function (newStatus) {
        if ($ctrl.selected === model) {
          $ctrl.selectedInfo.status = newStatus
          model.completed = status.completed
        }
      })
  }
}
