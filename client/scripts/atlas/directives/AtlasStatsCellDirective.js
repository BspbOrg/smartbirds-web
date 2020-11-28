var AtlasStatsCellController = require('../controllers/AtlasStatsCellController')

module.exports = function AtlasStatsCellDirective () {
  return {
    restrict: 'AE',
    templateUrl: '/views/atlas/_stats_cell.html',
    scope: {},
    controller: AtlasStatsCellController,
    controllerAs: '$ctrl'
  }
}
