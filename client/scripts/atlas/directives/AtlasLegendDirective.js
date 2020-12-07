var AtlasLegendController = require('../controllers/AtlasLegendController')

module.exports = function AtlasLegendDirective () {
  return {
    restrict: 'AE',
    templateUrl: '/views/atlas/_legend.html',
    scope: {},
    controller: AtlasLegendController,
    controllerAs: '$ctrl'
  }
}
