require('../app').controller('EBPSpeciesController', /* @ngInject */function ($scope, $q, EBPSpecies, ngToast) {
  const $ctrl = this

  $ctrl.page = 1
  $ctrl.pageSize = 20

  $ctrl.requestSpecies = function () {
    $q.resolve(EBPSpecies.query().$promise).then(function (rows) {
      $ctrl.count = rows.$$response.data.$$response.count
      $ctrl.species = rows
      $ctrl.pageChanged()
    })
  }

  $ctrl.pageChanged = function () {
    const start = ($ctrl.page - 1) * $ctrl.pageSize
    $ctrl.visible = $ctrl.species.slice(start, start + $ctrl.pageSize)
  }

  $ctrl.remove = function (idx) {
    const start = ($ctrl.page - 1) * $ctrl.pageSize
    $ctrl.species.splice(start + idx, 1)
    $ctrl.count = $ctrl.species.length
    if (start >= $ctrl.species.length && $ctrl.page > 0) {
      $ctrl.page--
    }
    $ctrl.pageChanged()
    $scope.editform.$setDirty()
  }

  $ctrl.add = function () {
    const len = $ctrl.species.push({
      ebpId: null,
      sbNameLa: null,
      sbNameEn: null
    })
    $ctrl.page = Math.ceil(len / $ctrl.pageSize)
    $ctrl.pageChanged()
    $scope.editform.$setDirty()
  }

  $ctrl.save = function () {
    if ($scope.editform.$invalid) return
    if (!$ctrl.species.length) {
      return
    }
    EBPSpecies.update({ items: $ctrl.species })
      .$promise.then(function (items) {
        $scope.editform.$setPristine()
        ngToast.create(
          {
            className: 'success',
            content: 'Species updated'
          })
      })
  }

  $ctrl.requestSpecies()
})
