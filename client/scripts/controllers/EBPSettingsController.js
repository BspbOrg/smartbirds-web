require('../app').controller('EBPSettingsController', /* @ngInject */function ($scope, $q, $stateParams, EBPSpecies) {
  const $ctrl = this

  $ctrl.selected = 'sources'
  if ($stateParams.settings) {
    $ctrl.selected = $stateParams.settings
  }
})
