module.exports = /* @ngInject */function AtlasStatsController (api, ngToast, $translate) {
  var $ctrl = this

  $ctrl.loading = true
  $ctrl.rows = []

  $ctrl.$onInit = function () {
    api.bgatlas2008.observerRanking()
      .then(function (rows) {
        $ctrl.rows = rows
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
        $ctrl.loading = false
      })
  }
}
