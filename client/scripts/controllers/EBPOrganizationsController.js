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
    api.settings.readSetting('ebp_organizations').then(function (res) {
      const allowed = JSON.parse(res.value) || []
      $ctrl.organizations.forEach(function (organization) {
        organization.allowed = allowed.includes(organization.slug)
      })
    })
  }

  $ctrl.save = function () {
    const allowed = $ctrl.organizations
      .filter((organization) => organization.allowed)
      .map((organization) => organization.slug)
    api.settings.updateSetting('ebp_organizations', JSON.stringify(allowed)).then(function () {
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
