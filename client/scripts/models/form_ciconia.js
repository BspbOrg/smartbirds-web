const angular = require('angular')
const LocalCache = require('./mixins/local_cache')
const countPendingReview = require('./mixins/countPendingReview')

require('../app').factory('FormCiconia', /* @ngInject */function ($resource, ENDPOINT_URL, db) {
  const FormCiconia = $resource(ENDPOINT_URL + '/ciconia/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/ciconia' },
    import: { method: 'POST', url: ENDPOINT_URL + '/import/ciconia' },
    countPendingReview
  })

  // instance methods
  angular.extend(FormCiconia.prototype, {
    afterCreate: function () {
      this.initDefaults()
    },
    getUser: function () {
      return db.users[this.user]
    },
    hasSource: true,
    preCopy: function () {
      delete this.primarySubstrateType
      delete this.electricityPole
      delete this.nestIsOnArtificialPlatform
      delete this.typeElectricityPole
      delete this.tree
      delete this.building
      delete this.nestOnArtificialHumanMadePlatform
      delete this.nestIsOnAnotherTypeOfSubstrate
      delete this.nestThisYearNotUtilizedByWhiteStorks
      delete this.thisYearOneTwoBirdsAppearedInNest
      delete this.approximateDateStorksAppeared
      delete this.approximateDateDisappearanceWhiteStorks
      delete this.thisYearInTheNestAppeared
      delete this.countJuvenilesInNest
      delete this.nestNotUsedForOverOneYear
      delete this.dataOnJuvenileMortalityFromElectrocutions
      delete this.dataOnJuvenilesExpelledFromParents
      delete this.diedOtherReasons
      delete this.reason
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
  angular.extend(FormCiconia, {
  })

  LocalCache.inject(FormCiconia, {
    name: 'ciconia'
  })

  return FormCiconia
})
