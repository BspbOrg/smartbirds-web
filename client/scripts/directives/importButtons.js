require('../app').directive('importButtons', /* @ngInject */function ($translate, ngToast, $uibModal) {
  return {
    restrict: 'E',
    templateUrl: '/views/directives/importbuttons.html',
    scope: {
      modelId: '=model',
      onComplete: '&'
    },
    controller: /* @ngInject */function ($scope, $injector) {
      const controller = this
      const model = $injector.get($scope.modelId)

      controller.internalImport = function (items, language, force) {
        return model.import({ items, skipErrors: force, language }).$promise
          .then(function (res) {
            ngToast.create({
              className: 'success',
              content: $translate.instant('You will be notified by email when your import is ready')
            })
          })
          .catch(function (error) {
            ngToast.create({
              className: 'danger',
              content: '<p>' + $translate.instant('Error during import') + '</p><pre>' + (error && error.data ? error.data.error : JSON.stringify(error, null, 2)) + '</pre>'
            })
          })
      }

      controller.import = function (inputType, items, language, ignoreErrors) {
        if (inputType !== 'csv') {
          ngToast.create({
            className: 'danger',
            content: '<p>' + $translate.instant('Error during import') + '</p><pre>' + 'Unsupported input type ' + inputType + '</pre>'
          })

          return
        }

        return controller.internalImport(items, language, ignoreErrors)
      }

      controller.openImportModal = function () {
        console.log('openImportModal')
        $uibModal.open({
          component: 'importRecordsModal',
          backdrop: 'static',
          resolve: {
            modelId: function () {
              return controller.modelId
            }
          }
        })
          .result.then(function (result) {
            console.log('result', result)
            if (result && result.records && result.records.length) {
              controller.import('csv', result.records, result.language, result.ignoreErrors)
            }
          }, function (reason) {
            // Modal dismissed
            console.log('reason', reason)
          })
      }
    },
    controllerAs: '$ctrl'
  }
})
