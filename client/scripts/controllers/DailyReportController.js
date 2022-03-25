const forms = require('../configs/forms')

require('../app').controller('DailyReportController', /* @ngInject */function ($state, $stateParams, $timeout, $translate, api, localization) {
  const $ctrl = this

  $ctrl.loading = false
  $ctrl.filter = {
    date: new Date($stateParams.date)
  }
  if (isNaN($ctrl.filter.date)) {
    $ctrl.filter.date = new Date()
  } else {
    $timeout(function () {
      $ctrl.update()
    })
  }
  $ctrl.data = null

  $ctrl.export = function () {
    const url = 'data:text/csv;charset=utf-8,\ufeff' +
      [
        [
          'DAILY_REPORT_LIST_TABLE_FORM',
          'DAILY_REPORT_LIST_TABLE_LOCATION',
          'DAILY_REPORT_LIST_TABLE_SPECIES',
          'DAILY_REPORT_LIST_TABLE_SPECIES_LATIN',
          'DAILY_REPORT_LIST_TABLE_COUNT'
        ].map(col => $translate.instant(col)),
        ...$ctrl.data.map(row => [
          $translate.instant($ctrl.formName(row.form)),
          localization.getLocalLabel(row.location),
          localization.getLocalLabel(row.species),
          row.species.la,
          row.count
        ])
      ].map(e => e.map(f => Number.isInteger(f) ? f : `"${f.replaceAll(/["]/g, ' ').replaceAll(';', ',').replaceAll(/\s+/g, ' ').trim()}"`).join(';')).join('\n')
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = encodeURI(url)
    a.download = `daily-report-${$stateParams.date}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  $ctrl.update = function (e) {
    if (e) {
      e.preventDefault()
    }
    $state.go('.', { date: $ctrl.filter.date.toISOString().split('T').shift() }, { notify: false })
    $ctrl.data = null
    $ctrl.loading = true
    api.reports.daily($ctrl.filter.date)
      .then((data) => {
        $ctrl.data = data.sort(function (a, b) {
          const aForm = $translate.instant($ctrl.formName(a.form))
          const bForm = $translate.instant($ctrl.formName(b.form))
          const formCmp = aForm.localeCompare(bForm)
          if (formCmp !== 0) return formCmp

          const aLocation = localization.getLocalLabel(a.location)
          const bLocation = localization.getLocalLabel(b.location)
          const locationCmp = aLocation.localeCompare(bLocation)
          if (locationCmp !== 0) return locationCmp

          const aSpecies = localization.getLocalLabel(a.species) || a.species.la
          const bSpecies = localization.getLocalLabel(b.species) || b.species.la
          return aSpecies.localeCompare(bSpecies)
        })
      })
      .finally(() => {
        $ctrl.loading = false
      })
  }

  $ctrl.formName = function (form) {
    return forms[form].shortLabel
  }
})
