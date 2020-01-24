require('../app').directive('organizationSelector', /* @ngInject */function () {
  return {
    restrict: 'E',
    scope: {
      model: '=',
      placeholder: '@?'
    },
    bindToController: true,
    templateUrl: '/views/directives/organizationselector.html',
    controllerAs: '$ctrl',
    controller: /* @ngInject */function ($scope, api, $translate) {
      var ctrl = this
      ctrl.organizations = []

      // Preselect BSPB organization if none is selected
      ctrl.model = ctrl.model || 'bspb'

      api.organizations().then(function (res) {
        ctrl.organizations = res.map(function (organization) {
          return {
            id: organization.slug,
            label: organization.label[$translate.$language] || organization.label.en
          }
        })
      })
    }
  }
})
