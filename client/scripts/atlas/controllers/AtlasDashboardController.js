var utils = require('../utils')

var BaseMapController = require('./BaseMapController')

module.exports = /* @ngInject */function AtlasDashboardController (api, ngToast, $state, $translate, user) {
  var $ctrl = this

  BaseMapController.apply(this)

  $ctrl.cells = (user.getIdentity().bgatlasCells || []).map(function (cell) {
    return utils.mapCellToMapModel(cell)
  })
}
