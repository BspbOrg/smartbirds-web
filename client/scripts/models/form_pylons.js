const angular = require('angular')
const LocalCache = require('./mixins/local_cache')
const countPendingReview = require('./mixins/countPendingReview')

require('../app').factory('FormPylons', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  const Form = $resource(ENDPOINT_URL + '/pylons/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/pylons' },
    countPendingReview: countPendingReview
  })

  // instance methods
  angular.extend(Form.prototype, {
    afterCreate: function () {
      this.initDefaults()
    },
    getUser: function () {
      return db.users[this.user]
    },
    getSpeciesNestOnPylon: function () {
      return db.species.birds && db.species.birds[this.speciesNestOnPylon]
    },
    preCopy: function () {
      delete this.speciesNestOnPylon
      delete this.typeNest
      delete this.pylonInsulated
    },
    postCopy: function () {
      this.initDefaults()
    },
    initDefaults: function () {
      this.confidential = false
      this.moderatorReview = false
    },
    hasNotes: true
  })

  // class methods
  angular.extend(Form, {})

  LocalCache.inject(Form, {
    name: 'pylons'
  })

  return Form
})
