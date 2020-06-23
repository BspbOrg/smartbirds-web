var angular = require('angular')
var LocalCache = require('./mixins/local_cache')
var countPendingReview = require('./mixins/countPendingReview')

require('../app').factory('FormHerptiles', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  var FormHerptiles = $resource(ENDPOINT_URL + '/herptiles/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/herptiles' },
    countPendingReview: countPendingReview
  })

  // instance methods
  angular.extend(FormHerptiles.prototype, {
    afterCreate: function () {
      this.initDefaults()
    },
    getUser: function () {
      return db.users[this.user]
    },
    getSpecies: function () {
      return db.species.herptiles && db.species.herptiles[this.species]
    },
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
  angular.extend(FormHerptiles, {
  })

  LocalCache.inject(FormHerptiles, {
    name: 'herptiles'
  })

  return FormHerptiles
})
