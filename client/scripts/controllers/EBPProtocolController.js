require('../app').controller('EBPProtocolController', /* @ngInject */function ($scope, $q, db, api, ngToast) {
  const $ctrl = this
  $ctrl.requestUploadProtocol = function () {
    api.ebp.protocol().then(function (res) {
      $ctrl.protocol = res.protocol || ''
    })
  }

  $ctrl.save = function () {
    api.ebp.updateProtocol($ctrl.protocol || '').then(function () {
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
