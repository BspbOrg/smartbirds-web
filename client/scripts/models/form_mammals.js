const angular = require('angular')
const LocalCache = require('./mixins/local_cache')
const countPendingReview = require('./mixins/countPendingReview')

require('../app').factory('FormMammals', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  const FormMammals = $resource(ENDPOINT_URL + '/mammals/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/mammals' },
    countPendingReview
  })

  // instance methods
  angular.extend(FormMammals.prototype, {
    afterCreate: function () {
      this.initDefaults()
    },
    getUser: function () {
      return db.users[this.user]
    },
    getSpecies: function () {
      return db.species.mammals && db.species.mammals[this.species]
    },
    hasSource: true,
    preCopy: function () {
      delete this.species
      delete this.sex
      delete this.age
      delete this.habitat
      delete this.findings
      delete this.count
      delete this.marking
      delete this.axisDistance
      delete this.weight
      delete this.sCLL
      delete this.mPLLcdC
      delete this.mCWA
      delete this.hLcapPl
      delete this.tempSubstrat
      delete this.tempAir
      delete this.tempCloaca
      delete this.sqVentr
      delete this.sqCaud
      delete this.sqDors
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
  angular.extend(FormMammals, {
  })

  LocalCache.inject(FormMammals, {
    name: 'mammals'
  })

  return FormMammals
})
