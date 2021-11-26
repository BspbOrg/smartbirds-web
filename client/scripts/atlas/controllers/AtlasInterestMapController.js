const utils = require('../utils')

const BaseExtendedMapController = require('./BaseExtendedMapController')

module.exports = /* @ngInject */function AtlasInterestMapController (api, ngToast, $translate) {
  const $ctrl = this

  $ctrl.selectable = true
  BaseExtendedMapController.apply(this, [ngToast, $translate])

  $ctrl.colors = utils.colors
  $ctrl.colors.none = '#cccccc'

  api.bgatlas2008.userGrid()
    .then(function (cells) {
      $ctrl.cells = cells.map(function (cell) {
        const model = {
          id: cell.utm_code,
          coordinates: cell.coordinates,
          cell: cell
        }
        if (cell.completed) {
          model.fill = { color: $ctrl.colors.completed, opacity: utils.unselectedOpacityFill }
          model.stroke = { color: $ctrl.colors.completed, opacity: utils.unselectedOpacityStroke }
        } else {
          switch (cell.selected) {
            case 0:
              model.fill = { color: $ctrl.colors.none, opacity: 0.1 }
              model.stroke = { color: $ctrl.colors.none, opacity: 0.4 }
              break
            case 1:
              model.fill = { color: $ctrl.colors.low, opacity: 0.35 }
              model.stroke = { color: $ctrl.colors.low, opacity: 0.4 }
              break
            case 2:
              model.fill = { color: $ctrl.colors.med, opacity: 0.35 }
              model.stroke = { color: $ctrl.colors.med, opacity: 0.8 }
              break
            default:
              model.fill = { color: $ctrl.colors.high, opacity: 0.35 }
              model.stroke = { color: $ctrl.colors.high, opacity: 0.4 }
              break
          }
        }
        return model
      })
    })
}
