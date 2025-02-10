require('../app').controller('ServerConfigController', /* @ngInject */function (api) {
  const $ctrl = this
  $ctrl.serverConfig = 'N/A'

  $ctrl.requestConfig = function () {
    api.server.config().then(function (res) {
      $ctrl.serverConfig = res.config || ''
    })
  }

  $ctrl.requestConfig()
})
