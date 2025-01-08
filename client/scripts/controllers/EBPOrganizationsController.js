require('../app').controller('EBPOrganizationsController', /* @ngInject */function ($scope, db, api, ngToast) {
  const $ctrl = this
  $ctrl.organizations = Object.values(db.organizations).map(
    function (organization) {
      return {
        slug: organization.slug,
        label: organization.toString(),
        allowed: false
      }
    }
  )

  $ctrl.requestAllowedOrganizations = function () {
    api.ebp.allowedOrganizations().then(function (res) {
      $ctrl.organizations.forEach(function (organization) {
        organization.allowed = res.includes(organization.slug)
      })
    })
  }

  $ctrl.save = function () {
    const allowed = $ctrl.organizations
      .filter(function (organization) {
        return organization.allowed
      })
      .map(function (organization) {
        return organization.slug
      })
    api.ebp.updateAllowedOrganizations(allowed).then(function () {
      $scope.editform.$setPristine()
      ngToast.create(
        {
          className: 'success',
          content: 'Organizations updated'
        })
      $ctrl.requestAllowedOrganizations()
    })
  }

  $ctrl.requestAllowedOrganizations()
})
