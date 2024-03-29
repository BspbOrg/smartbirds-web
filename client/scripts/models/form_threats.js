const angular = require('angular')
const LocalCache = require('./mixins/local_cache')
const countPendingReview = require('./mixins/countPendingReview')

require('../app').factory('FormThreats', /* @ngInject */function ($localStorage, $resource, $translate, ENDPOINT_URL, db) {
  const FormThreats = $resource(ENDPOINT_URL + '/threats/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/threats' },
    import: { method: 'POST', url: ENDPOINT_URL + '/import/threats' },
    countPendingReview
  })

  // instance methods
  angular.extend(FormThreats.prototype, {
    afterCreate: function () {
      this.initDefaults()
    },
    getUser: function () {
      return db.users[this.user]
    },
    getSpecies: function () {
      return db.species[this.class] && db.species[this.class][this.species]
    },
    hasSource: true,
    preCopy: function () {
      delete this.primaryType
      delete this.category
      delete this.species
      delete this.estimate
      delete this.poisonedType
      delete this.stateCarcass
      delete this.sampleTaken1
      delete this.sampleTaken2
      delete this.sampleTaken3
      delete this.class
      delete this.sampleCode1
      delete this.sampleCode2
      delete this.sampleCode3
      delete this.count
      delete this.threatsNotes
    },
    postCopy: function () {
      this.initDefaults()
    },
    initDefaults: function () {
      this.confidential = false
      this.moderatorReview = false
    }
  })

  // class methods
  angular.extend(FormThreats, {})

  LocalCache.inject(FormThreats, {
    name: 'threats'
  })

  return FormThreats
})
