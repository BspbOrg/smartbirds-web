const angular = require('angular')
const LocalCache = require('./mixins/local_cache')
const countPendingReview = require('./mixins/countPendingReview')

require('../app').factory('FormCBM', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  const FormCBM = $resource(ENDPOINT_URL + '/cbm/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/cbm' },
    countPendingReview
  })

  // instance methods
  angular.extend(FormCBM.prototype, {
    afterCreate: function () {
      this.initDefaults()
    },
    getUser: function () {
      return db.users[this.user]
    },
    getZone: function () {
      return db.zones[this.zone]
    },
    getSpecies: function () {
      return db.species.birds && db.species.birds[this.species]
    },
    getPosition: function () {
      return { lat: this.latitude, lng: this.longitude }
    },
    hasSource: true,
    preCopy: function () {
      delete this.species
      delete this.distance
      delete this.count
      delete this.plot
    },
    postCopy: function () {
      this.initDefaults()
    },
    initDefaults: function () {
      this.confidential = false
      this.moderatorReview = false
    },
    hasVisit: true,
    hasNotes: false
  })

  // class methods
  angular.extend(FormCBM, {})

  LocalCache.inject(FormCBM, {
    name: 'cbm'
  })

  return FormCBM
})
