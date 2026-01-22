require('../app').controller('EBPSourcesController', /* @ngInject */function ($scope, $q, db, api, ngToast) {
  const $ctrl = this
  $q.resolve(db.nomenclatures.$promise || db.nomenclatures).then(function (nomenclatures) {
    $ctrl.sources = Object.values(nomenclatures.ebp_source || []).map((source) => ({
      id: source.label.en,
      label: source.toString(),
      allowed: false
    }))
  })

  $ctrl.requestAllowedSources = function () {
    api.settings.readSetting('ebp_sources').then(function (res) {
      const allowed = JSON.parse(res.value) || []
      $ctrl.sources.forEach(function (source) {
        source.allowed = allowed.includes(source.id)
      })
    })
  }

  $ctrl.save = function () {
    const allowed = $ctrl.sources
      .filter((source) => source.allowed)
      .map((source) => source.id)
    api.settings.updateSetting('ebp_sources', JSON.stringify(allowed)).then(function () {
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
