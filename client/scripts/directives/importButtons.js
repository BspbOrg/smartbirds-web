const csvParse = require('csv-parse')

require('../app').directive('importButtons', /* @ngInject */function ($translate, ngToast) {
  return {
    restrict: 'E',
    templateUrl: '/views/directives/importbuttons.html',
    scope: {
      monitoringController: '<'
    },
    controller: /* @ngInject */function ($scope) {
      const input = document.getElementById('import-file')
      input.addEventListener('change', function () {
        const file = input.files[0]
        // eslint-disable-next-line no-undef
        const reader = new FileReader()
        const records = []
        reader.onload = function () {
          const csvData = reader.result
          const parser = csvParse.parse(csvData, {
            columns: true,
            delimiter: ';',
            skip_empty_lines: true
          })
          parser.on('readable', function () {
            let record
            while ((record = parser.read()) !== null) {
              records.push(record)
            }
          })
          parser.on('error', function (err) {
            ngToast.create({
              className: 'danger',
              content: '<p>' + $translate.instant('Error while reading CSV file') + '</p><pre>' + (err ? err.message : JSON.stringify(err, null, 2)) + '</pre>'
            })
          })

          $scope.monitoringController.import('csv', records)
        }
        reader.readAsText(file)
      })
    },
    controllerAs: '$ctrl'
  }
})
