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

      controller.import = function (inputType, items, language) {
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
              controller.internalImport(items, language, true)
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

        return controller.internalImport(items, language, false)
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
              controller.import('csv', result.records, result.language)
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