const angular = require('angular')
const LocalCache = require('./mixins/local_cache')
const countPendingReview = require('./mixins/countPendingReview')

const COPY_PERSIST_PROPS = Object.fromEntries([
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

  // form specific fields
  'migrationPoint'
].map(k => [k, true]))

require('../app').factory('FormBirdsMigrations', /* @ngInject */function ($localStorage, $resource, ENDPOINT_URL, db, localization) {
  const FormBirdsMigrations = $resource(ENDPOINT_URL + '/birds-migrations/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/birds-migrations' },
    import: { method: 'POST', url: ENDPOINT_URL + '/import/birds-migrations' },
    countPendingReview
  })

  // instance methods
  angular.extend(FormBirdsMigrations.prototype, {
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
  angular.extend(FormBirdsMigrations, {})

  LocalCache.inject(FormBirdsMigrations, {
    name: 'birds-migrations'
  })

  return FormBirdsMigrations
})
