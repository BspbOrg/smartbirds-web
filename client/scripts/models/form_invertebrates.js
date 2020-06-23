var angular = require('angular')
var LocalCache = require('./mixins/local_cache')
var countPendingReview = require('./mixins/countPendingReview')

require('../app').factory('FormInvertebrates', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  var FormInvertebrates = $resource(ENDPOINT_URL + '/invertebrates/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/invertebrates' },
    countPendingReview: countPendingReview
  })

  // instance methods
  angular.extend(FormInvertebrates.prototype, {
    afterCreate: function () {
      this.initDefaults()
    },
    getUser: function () {
      return db.users[this.user]
    },
    getSpecies: function () {
      return db.species.invertebrates && db.species.invertebrates[this.species]
    },
    preCopy: function () {
      delete this.species
      delete this.sex
      delete this.age
      delete this.habitat
      delete this.findings
      delete this.count
      delete this.marking
      delete this.speciesNotes
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
  angular.extend(FormInvertebrates, {
  })

  LocalCache.inject(FormInvertebrates, {
    name: 'invertebrates'
  })

  return FormInvertebrates
})
