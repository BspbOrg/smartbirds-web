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

      controller.importState = {
        success: false,
        importing: true,
        summary: null
      }

      controller.internalImport = function (items, language, force) {
        controller.importState.importing = true
        controller.importState.success = false
        controller.importState.summary = null

        return model.import({ items, skipErrors: force, language }).$promise
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
