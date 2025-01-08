require('../app').controller('EBPSettingsController', /* @ngInject */function ($scope, $stateParams) {
  const $ctrl = this

  $ctrl.selected = 'sources'
  if ($stateParams.settings) {
    $ctrl.selected = $stateParams.settings
  }
})
