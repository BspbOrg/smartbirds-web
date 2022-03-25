require('../app').controller('DailyReportController', /* @ngInject */function (api) {
  const $ctrl = this

  $ctrl.loading = false
  $ctrl.filter = {
    date: new Date()
  }
  $ctrl.data = null

  $ctrl.update = function (e) {
    if (e) {
      e.preventDefault()
    }
    $ctrl.data = null
    $ctrl.loading = true
    api.reports.daily($ctrl.filter.date)
      .then((data) => {
        $ctrl.data = data
      })
      .finally(() => {
        $ctrl.loading = false
      })
  }
})
