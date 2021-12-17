module.exports = /* @ngInject */function ($stateProvider) {
  $stateProvider
    .state('public_atlas', {
      url: '/bgatlas',
      templateUrl: '/views/home-bgatlas.html',
      controller: 'AtlasHomeController as $ctrl',
      title: 'PUBLIC_ATLAS_PAGE_TITLE'
    })

    .state('auth.atlas', {
      url: '/atlas',
      views: {
        'content@auth': {
          templateUrl: 'views/atlas/dashboard.html',
          controller: 'AtlasDashboardController as $ctrl'
        }
      }
    })
    .state('auth.atlas.missing_species', {
      url: '/missing',
      views: {
        'content@auth': {
          templateUrl: 'views/atlas/missing_species.html',
          controller: 'AtlasMissingSpeciesController as $ctrl'
        }
      }
    })
    .state('auth.atlas.new_species', {
      url: '/new',
      views: {
        'content@auth': {
          templateUrl: 'views/atlas/new_species.html',
          controller: 'AtlasNewSpeciesController as $ctrl'
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
    .state('auth.stats.atlas', {
      url: '/atlas',
      views: {
        'content@auth': {
          templateUrl: 'views/atlas/stats.html',
          controller: 'AtlasStatsController as $ctrl'
        }
      }
    })
    .state('auth.atlas.interest_map', {
      url: '/interest',
      views: {
        'content@auth': {
          templateUrl: 'views/atlas/interest.html',
          controller: 'AtlasInterestMapController as $ctrl'
        }
      }
    })
    .state('auth.atlas.moderator_progress', {
      url: '/mod_progress',
      views: {
        'content@auth': {
          templateUrl: 'views/atlas/moderator_progress.html',
          controller: 'AtlasModeratorProgressController as $ctrl'
        }
      }
    })
}
