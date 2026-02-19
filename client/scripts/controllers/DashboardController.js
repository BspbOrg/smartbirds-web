const forms = require('../configs/forms')

require('../app').controller('DashboardController', /* @ngInject */function (Zone, user, SuspiciousActivityAlert) {
  const vc = this

  vc.pendingZones = Zone.query({
    status: 'requested',
    limit: 10
  })

  vc.ownedZones = Zone.query({
    status: 'owned',
    limit: 100,
    owner: user.getIdentity().id
  })

  vc.forms = forms

  if (user.isAdmin()) {
    vc.suspiciousStats = { newCount: 0, investigatingCount: 0 }
    SuspiciousActivityAlert.stats().$promise.then(function (stats) {
      vc.suspiciousStats = stats
    }).catch(function (err) {
      console.error('Error loading suspicious activity stats:', err)
    })
  }
})
