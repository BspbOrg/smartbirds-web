const utils = require('../utils')
const BaseMapController = require('./BaseMapController')

module.exports = function BaseExtendedMapController (ngToast, $translate) {
  if (!ngToast || !$translate) throw new Error('missing dependencies')

  const $ctrl = this

  BaseMapController.apply(this)

  $ctrl.loadCellInfo = $ctrl.loadCellInfo || function () {}
  $ctrl.cells = []

  let lastCellInfoRequest = null

  $ctrl.updateModelStyle = utils.updateModelStyle

  function setSelectedCell (model) {
    // cancel last cell request if any
    if (lastCellInfoRequest) {
      lastCellInfoRequest.cancel()
      lastCellInfoRequest = null
    }

    // unselect previous
    if ($ctrl.selected) {
      $ctrl.updateModelStyle($ctrl.selected, false)
    }

    // unselect on second select
    if ($ctrl.selected === model) {
      $ctrl.loading = false
      $ctrl.selected = null
      $ctrl.selectedInfo = null
      return
    }

    $ctrl.updateModelStyle(model, true)
    $ctrl.selected = model
    $ctrl.loading = true

    const call = lastCellInfoRequest = $ctrl.loadCellInfo(model)
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
