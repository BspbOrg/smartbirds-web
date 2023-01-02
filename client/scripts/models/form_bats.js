const angular = require('angular')
const LocalCache = require('./mixins/local_cache')
const countPendingReview = require('./mixins/countPendingReview')

const COPY_PERSIST_PROPS = Object.fromEntries([
  'latitude',
  'longitude',
  'geolocationAccuracy',
  'nameWaterBody',

  // common fields
  'observationMethodology',
  'source',
  'observationDateTime',
  'monitoringCode',
  'endDateTime',
  'startDateTime',
  'observers',
  'rain',
  'temperature',
  'windDirection',
  'windSpeed',
  'cloudiness',
  'cloudsType',
  'visibility',
  'mto',
  'notes',
  'threats',
  'track',
  'location',
  'user',
  'organization',

  // form fields
  'metodology',
  'tCave',
  'hCave',
  'typloc',
  'habitats'
].map(k => [k, true]))

require('../app').factory('FormBats', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  const FormBats = $resource(ENDPOINT_URL + '/bats/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/bats' },
    countPendingReview
  })

  // instance methods
  angular.extend(FormBats.prototype, {
    afterCreate: function () {
      this.initDefaults()
    },
    getUser: function () {
      return db.users[this.user]
    },
    getSpecies: function () {
      return db.species.fishes && db.species.fishes[this.species]
    },
    hasSource: true,
    preCopy: function () {
      Object
        .keys(this)
        .filter(key => !key.startsWith('$') && !(key in COPY_PERSIST_PROPS))
        .forEach(key => delete this[key])
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
  angular.extend(FormBats, {
  })

  LocalCache.inject(FormBats, {
    name: 'bats'
  })

  return FormBats
})
