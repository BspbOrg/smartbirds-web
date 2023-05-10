const csvParse = require('csv-parse')

require('../app').directive('importButtons', /* @ngInject */function ($translate, ngToast, $uibModal) {
  return {
    restrict: 'E',
    templateUrl: '/views/directives/importbuttons.html',
    scope: {
      modelId: '=model',
      onComplete: '&'
    },
    link: function (scope, element, attrs, controller) {
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

          controller.import('csv', records)
        }

        reader.readAsText(file)
      })
    },
    controller: /* @ngInject */function ($scope, $injector) {
      const controller = this
      const model = $injector.get($scope.modelId)
      controller.importState = {
        success: false,
        importing: true,
        summary: null
      }

      controller.internalImport = function (items, force) {
        controller.importState.importing = true
        controller.importState.success = false
        controller.importState.summary = null

        return model.import({ items, skipErrors: force }).$promise
          .then(function (res) {
            controller.importState.success = true
            controller.importState.summary = res
          })
          .catch(function (error) {
            controller.importState.success = false
            controller.importState.summary = error.data
          })
          .finally(function (res) {
            controller.importState.importing = false
            $scope.onComplete({ params: 'lalalala' })
          })
      }

      controller.import = function (inputType, items) {
        if (inputType !== 'csv') {
          ngToast.create({
            className: 'danger',
            content: '<p>' + $translate.instant('Error during import') + '</p><pre>' + 'Unsupported input type ' + inputType + '</pre>'
          })

          return
        }

        $uibModal.open({
          templateUrl: 'views/import_summary.html',
          controller: function ($uibModalInstance, state) {
            this.state = state

            this.close = function () {
              $uibModalInstance.close()
            }

            this.forceImport = function () {
              controller.internalImport(items, true)
            }
          },
          controllerAs: 'ctrl',
          backdrop: 'static',
          resolve: {
            state: function () {
              return controller.importState
            }
          }
        })

        return controller.internalImport(items, false)
      }
    },
    controllerAs: '$ctrl'
  }
})
