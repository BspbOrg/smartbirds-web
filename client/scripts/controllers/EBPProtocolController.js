require('../app').controller('EBPProtocolController', /* @ngInject */function ($scope, $q, db, api, ngToast) {
  const $ctrl = this
  $ctrl.requestUploadProtocol = function () {
    api.settings.readSetting('ebp_protocol').then(function (res) {
      $ctrl.protocol = res.value || ''
    })
  }

  $ctrl.save = function () {
    api.settings.updateSetting('ebp_protocol', $ctrl.protocol || '').then(function () {
      $scope.editform.$setPristine()
      ngToast.create(
        {
          className: 'success',
          content: 'Protocol updated'
        })
      $ctrl.requestUploadProtocol()
    })
  }

  $ctrl.requestUploadProtocol()
})
