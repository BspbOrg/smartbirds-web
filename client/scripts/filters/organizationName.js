require('../app').filter('organizationName', /* @ngInject */function (db) {
  return function (slug) {
    return '' + db.organizations[slug]
  }
})
