require('../app').directive('dashboardCard', /* @ngInject */function () {
  return {
    restrict: 'E',
    templateUrl: '/views/directives/dashboardCard.html',
    scope: {
      count: '<',
      label: '@',
      icon: '@',
      status: '<',
      headingState: '@',
      headingStateParams: '<',
      footerLabel: '@',
      footerState: '@',
      footerStateParams: '<'
    },
    bindToController: true,
    controller: function () {},
    controllerAs: '$ctrl'
  }
})
