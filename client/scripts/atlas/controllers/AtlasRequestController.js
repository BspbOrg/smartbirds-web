var utils = require('../utils')

var BaseMapController = require('./BaseMapController')

module.exports = /* @ngInject */function AtlasRequestController (api, ngToast, $state, $translate, user) {
  var $ctrl = this

  $ctrl.MAX = 10

  BaseMapController.apply(this)

  $ctrl.cells = []
  $ctrl.selected = []

  api.bgatlas2008.userGrid().then(function (cells) {
    $ctrl.cells = cells.map(function (cell) {
      var selected = user.getIdentity().bgatlasCells && user.getIdentity().bgatlasCells.some(function (c) {
        return c.utm_code === cell.utm_code
      })

      var model = utils.mapCellToMapModel(cell, selected)

      if (selected) {
        $ctrl.selected.push(model)
      }
      return model
    })
  })

  $ctrl.unselect = function (selectedIdx) {
    if (!(selectedIdx in $ctrl.selected)) {
      return
    }
    var model = $ctrl.selected[selectedIdx]
    $ctrl.selected.splice(selectedIdx, 1)
    utils.updateModelStyle(model, false)
  }

  $ctrl.select = function (model) {
    $ctrl.selected.push(model)
    utils.updateModelStyle(model, true)
  }

  $ctrl.events = {
    click: function (poly, event, model) {
      var selectedIdx = $ctrl.selected.indexOf(model)
      if (selectedIdx !== -1) {
        $ctrl.unselect(selectedIdx)
      } else {
        $ctrl.select(model)
      }
    }
  }

  $ctrl.save = function () {
    api.bgatlas2008.setSelected($ctrl.selected.map(function (model) { return model.id }))
      .then(function () {
        var identity = user.getIdentity()
        identity.bgatlasCells = $ctrl.selected.map(function (model) {
          return model.cell
        })
        user.setIdentity(identity)

        $state.go('^')
      })
      .then(function () {
        ngToast.create({
          className: 'success',
          content: $translate.instant('Saved successfully')
        })
      })
      .catch(function (error) {
        ngToast.create({
          className: 'danger',
          content: '<p>' + $translate.instant('Error while saving') + '</p><pre>' + (error && error.data ? error.data.error : JSON.stringify(error, null, 2)) + '</pre>'
        })
      })
  }
}
