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
  'species',
  'habitat',
  'count'

].map(k => [k, true]))

require('../app').factory('FormBears', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  const FormBears = $resource(ENDPOINT_URL + '/bears/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/bears' },
    import: { method: 'POST', url: ENDPOINT_URL + '/import/bears' },
    countPendingReview
  })

  // instance methods
  angular.extend(FormBears.prototype, {
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
      Object
        .keys(this)
        .filter(key => !key.startsWith('$') && !(key in COPY_PERSIST_PROPS))
        .forEach(key => delete this[key])
    },
    postCopy: function () {
      this.initDefaults()
    },
    initDefaults: function () {
      this.confidential = true
      this.moderatorReview = false
      this.species = 'Ursus arctos'
    },
    hasNotes: true
  })

  // class methods
  angular.extend(FormBears, {
  })

  LocalCache.inject(FormBears, {
    name: 'bears'
  })

  return FormBears
})
