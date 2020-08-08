module.exports = /* @ngInject */function ($stateProvider) {
  $stateProvider
    .state('auth.atlas', {
      url: '/atlas',
      views: {
        'content@auth': {
          templateUrl: 'views/atlas/dashboard.html',
          controller: 'AtlasDashboardController as $ctrl'
        }
      }
    })
    .state('auth.atlas.request', {
      url: '/request',
      views: {
        'content@auth': {
          templateUrl: 'views/atlas/request.html',
          controller: 'AtlasRequestController as $ctrl'
        }
      }
    })
}
