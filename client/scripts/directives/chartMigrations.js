const COLOR_SCHEME = ['#e60049', '#0bb4ff', '#50e991', '#e6d800', '#9b19f5', '#ffa300', '#dc0ab4', '#b3d4ff', '#00bfa0']

require('../app').directive('chartMigrations', /* @ngInject */function () {
  return {
    restrict: 'AE',
    templateUrl: '/views/charts/migrations.html',
    scope: {
      data: '=',
      species: '=specie'
    },
    bindToController: true,
    controller: /* @ngInject */function ($scope, localization) {
      const $ctrl = this
      $ctrl.chartLoaded = global.Chart != null

      $ctrl.$onInit = function () {
        if (!$ctrl.data) return

        $scope.$watch('$ctrl.species', function (species) {
          $ctrl.chartLoaded = global.Chart != null
          if (!species) return

          const datasets = {}
          const list = {}

          const getKey = (record) => record.species.label.la + record.season + record.date.split('-').shift()

          const key = getKey($ctrl.data.find((record) => Object.values(record.species.label).includes(species)))
          $ctrl.data.filter(record => getKey(record) === key).forEach((record) => {
            const date = record.date.split('T').shift()
            datasets[date] = datasets[date] || {}
            const label = localization.getLocalLabel(record.migrationPoint.label)
            datasets[date][label] = Number(datasets[date][label] || 0) + Number(record.count)
            list[label] = (list[label] || 0) + datasets[date][label]
          })

          $ctrl.labels = Object.keys(datasets).sort()
          $ctrl.datasets = Object.entries(list).map(([label, order], idx) => ({
            label,
            data: $ctrl.labels.map((date) => datasets[date][label] || 0),
            backgroundColor: COLOR_SCHEME[idx % COLOR_SCHEME.length],
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.6)',
            order: -order
          }))
          $ctrl.config = {
            type: 'bar',
            data: {
              labels: $ctrl.labels,
              datasets: $ctrl.datasets
            },
            options: {
              layout: {
                autoPadding: true
              },
              scales: {
                x: {
                  stacked: true
                },
                y: {
                  beginAtZero: true,
                  stacked: true
                }
              }
            }
          }
        })

        $scope.$watch(() => Boolean($ctrl.chartLoaded && $ctrl.canvas) && $ctrl.config, function (config) {
          if ($ctrl.chart) $ctrl.chart.destroy()
          if (!config) return
          $ctrl.chart = new global.Chart($ctrl.canvas, config)
        })
        $scope.$on('$destroy', function () {
          if ($ctrl.chart) $ctrl.chart.destroy()
        })
      }
    },
    controllerAs: '$ctrl'
  }
})
