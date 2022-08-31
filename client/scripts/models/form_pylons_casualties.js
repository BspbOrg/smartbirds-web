const angular = require('angular')
const LocalCache = require('./mixins/local_cache')
const countPendingReview = require('./mixins/countPendingReview')

require('../app').factory('FormPylonsCasualties', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  const Form = $resource(ENDPOINT_URL + '/pylons-casualties/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/pylons-casualties' },
    countPendingReview
  })

  // instance methods
  angular.extend(Form.prototype, {
    afterCreate: function () {
      this.initDefaults()
    },
    getUser: function () {
      return db.users[this.user]
    },
    getSpecies: function () {
      return db.species.birds && db.species.birds[this.species]
    },
    hasSource: true,
    preCopy: function () {
      delete this.species
      delete this.count
      delete this.age
      delete this.sex
      delete this.causeOfDeath
      delete this.bodyCondition
    },
    postCopy: function () {
      this.initDefaults()
    },
    initDefaults: function () {
      this.confidential = false
      this.moderatorReview = false
      this.count = 1
    },
    hasNotes: true
  })

  // class methods
  angular.extend(Form, {})

  LocalCache.inject(Form, {
    name: 'pylons-casualties'
  })

  return Form
})
