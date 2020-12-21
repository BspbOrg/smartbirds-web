var utils = require('../utils')

var BaseMapController = require('./BaseMapController')

module.exports = /* @ngInject */function AtlasDashboardController (api, ngToast, $state, $translate, user) {
  var $ctrl = this

  BaseMapController.apply(this)

  $ctrl.selected = null
  $ctrl.rows = []
  $ctrl.loading = false

  $ctrl.cells = (user.getIdentity().bgatlasCells || []).map(function (cell) {
    return utils.mapCellToMapModel(cell)
  })

  var lastCellInfoRequest = null

  $ctrl.events = {
    click: function (poly, event, model) {
      if (lastCellInfoRequest) {
        lastCellInfoRequest.cancel()
        lastCellInfoRequest = null
      }
      if ($ctrl.selected) {
        utils.updateModelStyle($ctrl.selected, false)
      }
      if ($ctrl.selected === model) {
        $ctrl.loading = false
        $ctrl.selected = null
        $ctrl.rows = []
      } else {
        $ctrl.selected = model
        utils.updateModelStyle(model, true)
        $ctrl.rows = []
        $ctrl.loading = true
        var call = lastCellInfoRequest = api.bgatlas2008.getCellInfo(model.cell.utm_code)
        call
          .then(function (rows) {
            if ($ctrl.selected === model) {
              $ctrl.rows = rows
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
    }
  }
}
