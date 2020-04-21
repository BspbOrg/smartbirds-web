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
    controller: /* @ngInject */function ($scope, api, $translate, Organization) {
      var ctrl = this
      ctrl.organizations = []

      // Preselect BSPB organization if none is selected
      ctrl.model = ctrl.model || 'bspb'

      $scope.$watch(function () { return $translate.$language }, function () {
        api.organizations().then(function (res) {
          ctrl.organizations = res.map(function (organization) {
            return {
              id: organization.slug,
              label: Organization.prototype.toString.apply(organization)
            }
          })
        })
      })
    }
  }
})
