require('../app').controller('EBPSourcesController', /* @ngInject */function ($scope, $q, db, api, ngToast) {
  const $ctrl = this
  $q.resolve(db.nomenclatures.$promise || db.nomenclatures).then(function (nomenclatures) {
    $ctrl.sources = Object.values(nomenclatures.main_source || []).map((source) => ({
      id: source.label.en,
      label: source.toString(),
      allowed: false
    }))
  })

  $ctrl.requestAllowedSources = function () {
    api.ebp.sources().then(function (res) {
      $ctrl.sources.forEach(function (source) {
        source.allowed = res.includes(source.id)
      })
    })
  }

  $ctrl.save = function () {
    const allowed = $ctrl.sources
      .filter((source) => source.allowed)
      .map((source) => source.id)
    api.ebp.updateSources(allowed).then(function () {
      $scope.editform.$setPristine()
      ngToast.create(
        {
          className: 'success',
          content: 'Sources updated'
        })
      $ctrl.requestAllowedSources()
    })
  }

  $ctrl.requestAllowedSources()
})
