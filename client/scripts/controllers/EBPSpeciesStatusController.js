require('../app').controller('EBPSpeciesStatusController', /* @ngInject */function ($scope, $q, EBPSpeciesStatus, ngToast) {
  const $ctrl = this

  $ctrl.requestSpeciesStatuses = function () {
    $q.resolve(EBPSpeciesStatus.query().$promise).then(function (rows) {
      $ctrl.speciesStatuses = rows
    })
  }

  $ctrl.remove = function (idx) {
    $ctrl.speciesStatuses.splice(idx, 1)
    $scope.editform.$setDirty()
  }

  $ctrl.add = function () {
    $ctrl.speciesStatuses.push({
      ebpId: null,
      sbNameEn: null
    })
    $scope.editform.$setDirty()
  }

  $ctrl.save = function () {
    if ($scope.editform.$invalid) return
    if (!$ctrl.speciesStatuses.length) {
      return
    }
    EBPSpeciesStatus.update({ items: $ctrl.speciesStatuses })
      .$promise.then(function (items) {
        $scope.editform.$setPristine()
        ngToast.create(
          {
            className: 'success',
            content: 'Species statuses updated'
          })
      })
  }

  $ctrl.requestSpeciesStatuses()
})
