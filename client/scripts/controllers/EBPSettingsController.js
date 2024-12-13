require('../app').controller('EBPSettingsController', /* @ngInject */function ($q, $stateParams, EBPSpecies) {
  const $ctrl = this

  $ctrl.selected = 'sources'

  if ($stateParams.settings) {
    $ctrl.selected = $stateParams.settings
  }

  $ctrl.requestSpecies = function () {
    $q.resolve(EBPSpecies.query().$promise).then(function (species) {
      $ctrl.species = species
    })
  }

  $ctrl.requestSpecies()
})
