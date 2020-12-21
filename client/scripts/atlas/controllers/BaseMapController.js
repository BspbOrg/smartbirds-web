var utils = require('../utils')

module.exports = function BaseMapController (ngToast, $translate) {
  if (!ngToast || !$translate) throw new Error('missing dependencies')

  var $ctrl = this

  $ctrl.loadCellInfo = $ctrl.loadCellInfo || function () {}
  $ctrl.cells = []
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

  var lastCellInfoRequest = null

  function setSelectedCell (model) {
    // cancel last cell request if any
    if (lastCellInfoRequest) {
      lastCellInfoRequest.cancel()
      lastCellInfoRequest = null
    }

    // unselect previous
    if ($ctrl.selected) {
      utils.updateModelStyle($ctrl.selected, false)
    }

    // unselect on second select
    if ($ctrl.selected === model) {
      $ctrl.loading = false
      $ctrl.selected = null
      $ctrl.selectedInfo = null
      return
    }

    utils.updateModelStyle(model, true)
    $ctrl.selected = model
    $ctrl.loading = true

    var call = lastCellInfoRequest = $ctrl.loadCellInfo(model)
    call
      .then(function (info) {
        if ($ctrl.selected === model) {
          $ctrl.selectedInfo = info
        }
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
        if ($ctrl.selected === model) {
          $ctrl.loading = false
        }
        if (call === lastCellInfoRequest) {
          lastCellInfoRequest = null
        }
      })
  }

  if ($ctrl.selectable) {
    $ctrl.selected = null
    $ctrl.loading = false
    $ctrl.selectedInfo = null
    $ctrl.events = {
      click: function (poly, event, model) {
        setSelectedCell(model)
      }
    }
  }
}
