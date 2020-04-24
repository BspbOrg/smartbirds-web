const languages = require('../../../config/languages')

require('../app').controller('OrganizationsController', /* @ngInject */function ($scope, $state, $stateParams, db, Organization, $q, $translate, ngToast, Raven) {
  var $ctrl = this

  $ctrl.organizations = db.organizations
  $ctrl.languages = languages

  if ($stateParams.slug) {
    if ($stateParams.slug in db.organizations) {
      $ctrl.selected = db.organizations[$stateParams.slug] || {}
    } else {
      $state.go('.', { slug: null }, {})
    }
  }

  $ctrl.save = function () {
    if ($scope.editform.$invalid) return
    if (!$ctrl.selected) {
      return
    }

    $ctrl.selected.$save()
      .then(function (res) {
        ngToast.create({
          className: 'success',
          content: $translate.instant('Changes are saved successfully')
        })
        return res
      }, function (error) {
        Raven.captureMessage(JSON.stringify(error))
        ngToast.create({
          className: 'danger',
          content: '<p>' + $translate.instant('Could not save changes') + '</p><pre>' + (error && error.data ? error.data.error : JSON.stringify(error, null, 2)) + '</pre>'
        })
        return $q.reject(error)
      })
      .then(function (res) {
        $scope.editform.$setPristine()
        db.$updateOrganizations()
        $state.go('.', { slug: null }, {})
      })
  }
})
