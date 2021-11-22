const utils = require('../utils')

const BaseExtendedMapController = require('./BaseExtendedMapController')

module.exports = /* @ngInject */function AtlasModeratorProgressController (api, ngToast, $state, $translate) {
  const $ctrl = this

  $ctrl.selectable = true
  BaseExtendedMapController.apply(this, [ngToast, $translate])

  $ctrl.colors = utils.colors
  $ctrl.colors.vhigh = '#31c1f1'

  $ctrl.updateModelStyle = function (model, selected) {
    if (selected) {
      return utils.updateModelStyle(model, selected)
    }

    model.fill.opacity = utils.unselectedOpacityFill()
    model.stroke.opacity = 0.4
    if (model.completed) {
      model.fill.color = utils.colors.completed
      model.stroke.color = utils.colors.completed
    } else if (model.percent <= 40) {
      model.fill.color = utils.colors.low
      model.stroke.color = utils.colors.low
    } else if (model.percent <= 70) {
      model.fill.color = utils.colors.med
      model.stroke.color = utils.colors.med
    } else if (model.percent <= 90) {
      model.fill.color = utils.colors.high
      model.stroke.color = utils.colors.high
    } else {
      model.fill.color = $ctrl.colors.vhigh
      model.stroke.color = $ctrl.colors.vhigh
    }

    return model
  }

  api.bgatlas2008.globalCellStats().then(function (cells) {
    $ctrl.cells = cells.map(function (cell) {
      const model = utils.mapCellToMapModel(cell)
      return $ctrl.updateModelStyle(model, false)
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
        }
      })
  }
}
