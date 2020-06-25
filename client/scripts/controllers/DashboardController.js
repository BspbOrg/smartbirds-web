var forms = require('../configs/forms')

require('../app').controller('DashboardController', /* @ngInject */function (Zone, user) {
  var vc = this

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
})
