const angular = require('angular')
const LocalCache = require('./mixins/local_cache')
const countPendingReview = require('./mixins/countPendingReview')

require('../app').factory('FormPlants', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  const Form = $resource(ENDPOINT_URL + '/plants/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/plants' },
    import: { method: 'POST', url: ENDPOINT_URL + '/import/plants' },
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
      return db.species.plants && db.species.plants[this.species]
    },
    getAccompanyingSpecies: function () {
      return db.species.plants && (this.accompanyingSpecies || []).map(function (species) {
        return db.species.plants[species]
      })
    },
    hasSource: true,
    preCopy: function () {
      delete this.species
      delete this.elevation
      delete this.habitat
      delete this.accompanyingSpecies
      delete this.reportingUnit
      delete this.phenologicalPhase
      delete this.count
      delete this.density
      delete this.cover
      delete this.threatsPlants
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
  angular.extend(Form, {})

  LocalCache.inject(Form, {
    name: 'plants'
  })

  return Form
})
