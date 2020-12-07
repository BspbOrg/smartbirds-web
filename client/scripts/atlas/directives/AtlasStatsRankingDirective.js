var AtlasStatsRankingController = require('../controllers/AtlasStatsRankingController')

module.exports = function AtlasStatsRankingDirective () {
  return {
    restrict: 'AE',
    templateUrl: '/views/atlas/_stats_ranking.html',
    scope: {},
    controller: AtlasStatsRankingController,
    controllerAs: '$ctrl'
  }
}
