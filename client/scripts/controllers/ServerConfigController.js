require('../app').controller('ServerConfigController', /* @ngInject */function (api) {
  const $ctrl = this
  $ctrl.serverConfig = 'N/A'
  $ctrl.configVariables = []

  $ctrl.requestConfig = function () {
    api.server.config().then(function (res) {
      $ctrl.configVariables = (res.config.environmentVariables || []).sort((a, b) => a.key.localeCompare(b.key))
    })
  }

  $ctrl.save = () => {
  }

  $ctrl.requestConfig()
})
