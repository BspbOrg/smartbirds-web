require('../app').controller('EBPOrganizationsController', /* @ngInject */function ($scope, $q, db, api, ngToast) {
  const $ctrl = this
  $q.resolve(db.organizations.$promise || db.organizations).then(function (organizations) {
    $ctrl.organizations = Object.values(organizations).map((organization) => ({
      slug: organization.slug,
      label: organization.toString(),
      allowed: false
    }))
  })

  $ctrl.requestAllowedOrganizations = function () {
    api.ebp.allowedOrganizations().then(function (res) {
      $ctrl.organizations.forEach(function (organization) {
        organization.allowed = res.includes(organization.slug)
      })
    })
  }

  $ctrl.save = function () {
    const allowed = $ctrl.organizations
      .filter((organization) => organization.allowed)
      .map((organization) => organization.slug)
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
