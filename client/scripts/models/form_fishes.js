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

  // habitat fields
  'transectLength_M',
  'transectWidth_M',
  'fishingArea_M',
  'exposition',
  'meshSize',
  'countNetTrap',
  'waterTemp',
  'conductivity',
  'pH',
  'o2mgL',
  'o2percent',
  'salinity',
  'habitatDescriptionType',
  'substrateMud',
  'substrateSilt',
  'substrateSand',
  'substrateGravel',
  'substrateSmallStones',
  'substrateCobble',
  'substrateBoulder',
  'substrateRock',
  'substrateOther',
  'waterLevel',
  'riverCurrent',
  'transectAvDepth',
  'transectMaxDepth',
  'slope',
  'bankType',
  'shading',
  'riparianVegetation',
  'shelters',
  'transparency',
  'vegetationType'
].map(k => [k, true]))

require('../app').factory('FormFishes', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  const FormFishes = $resource(ENDPOINT_URL + '/fishes/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/fishes' },
    countPendingReview
  })

  // instance methods
  angular.extend(FormFishes.prototype, {
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
  angular.extend(FormFishes, {
  })

  LocalCache.inject(FormFishes, {
    name: 'fishes'
  })

  return FormFishes
})
