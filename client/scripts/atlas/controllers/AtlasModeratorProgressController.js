const utils = require('../utils')

const BaseExtendedMapController = require('./BaseExtendedMapController')

module.exports = /* @ngInject */function AtlasModeratorProgressController (api, ngToast, $state, $translate) {
  const $ctrl = this

  $ctrl.selectable = true
  BaseExtendedMapController.apply(this, [ngToast, $translate])

  $ctrl.colors = utils.colors
  $ctrl.colors.vhigh = '#3141f1'

  $ctrl.updateModelStyle = function (model, selected) {
    if (selected) {
      return utils.updateModelStyle(model, selected)
    }

    model.fill.opacity = utils.unselectedOpacityFill()
    model.stroke.opacity = 0.4
    if (model.percent <= 40) {
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
    return Promise.resolve(model)
  }
}
