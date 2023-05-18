const csvParse = require('csv-parse')
const languages = require('../../../config/languages')

require('../app').directive('importRecordsModal', /* @ngInject */function (ngToast, $translate) {
  return {
    templateUrl: '/views/directives/importrecordsmodal.html',
    scope: {
      close: '&',
      resolve: '<'
    },
    link: function (scope, element, attrs, controller) {
      const input = document.getElementById('import-file')
      input.addEventListener('change', function () {
        const file = input.files[0]

        scope.$apply(function () {
          controller.loading = true
          controller.fileName = file.name
        })

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
          parser.on('end', function () {
            controller.fileReady(records)
          })
        }

        reader.readAsText(file)
      })
    },
    controller: /* @ngInject */function ($scope) {
      const controller = this
      controller.fileName = null
      controller.loading = false
      controller.records = []
      controller.language = 'bg'
      controller.canImport = false

      controller.availableLanguages = Object.keys(languages).map(function (key) {
        return {
          id: key,
          label: languages[key].label
        }
      })

      $scope.$watch('$ctrl.records', function (newValue) {
        console.log('watch', newValue)
        controller.canImport = newValue && newValue.length > 0
      })

      controller.fileReady = function (records) {
        $scope.$apply(function () {
          controller.loading = false
          console.log('fileReady' + records.length, records)
          controller.records = records
        })
      }
      controller.startImport = function () {
        $scope.close({
          $value: {
            records: controller.records,
            language: controller.language
          }
        })
      }
      controller.dismiss = function () {
        $scope.close({
          $value: null
        })
      }
    },
    controllerAs: '$ctrl'
  }
})
