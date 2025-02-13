require('../app').controller('ServerConfigController', /* @ngInject */function (api, $scope, ngToast) {
  const $ctrl = this
  $ctrl.serverConfig = 'N/A'
  $ctrl.configVariables = []
  $ctrl.pendingConfig = false
  let originalConfig = []

  $ctrl.requestConfig = function () {
    api.server.config().then(function (res) {
      originalConfig = res.config.environmentVariables || []
      $ctrl.pendingConfigurationChange = res.config.pendingConfigurationChange
      $ctrl.configVariables = ((originalConfig || []).toSorted((a, b) => a.key.localeCompare(b.key))).map((variable) => {
        return {
          key: variable.key,
          value: variable.value
        }
      })
    })
  }

  $ctrl.save = () => {
    // only send changed variables
    const changed = $ctrl.configVariables.filter((variable) => {
      return originalConfig.find((original) => { return original.key === variable.key && original.value !== variable.value })
    })

    api.server.updateConfig(changed).then(function () {
      $scope.editform.$setPristine()
      ngToast.create(
        {
          className: 'success',
          content: 'Config updated'
        })
    })
  }

  $ctrl.requestConfig()
})
