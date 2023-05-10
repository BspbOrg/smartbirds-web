const angular = require('angular')
const LocalCache = require('./mixins/local_cache')
const countPendingReview = require('./mixins/countPendingReview')

require('../app').factory('FormBirds', /* @ngInject */function ($localStorage, $resource, ENDPOINT_URL, db, localization) {
  const FormBirds = $resource(ENDPOINT_URL + '/birds/:id', {
    id: '@id'
  }, {
    // api methods
    export: { method: 'POST', url: ENDPOINT_URL + '/export/birds' },
    import: { method: 'POST', url: ENDPOINT_URL + '/import/birds' },
    countPendingReview
  })

  // instance methods
  angular.extend(FormBirds.prototype, {
    afterCreate: function () {
      this.initDefaults()
    },
    getUser: function () {
      return db.users[this.user]
    },
    getSpecies: function () {
      return db.species.birds && db.species.birds[this.species]
    },
    getCount: function (locale) {
      const parts = []
      parts.push(localization.getLocalLabel(this.typeUnit.label, locale))
      if (!['Min.', 'Max.', 'Range', 'Unspecified number'].includes(this.typeUnit.label.en)) {
        parts.push(this.count)
      }
      if (['Min.', 'Range'].includes(this.typeUnit.label.en)) {
        parts.push(this.countMin)
      }
      if (['Range'].includes(this.typeUnit.label.en)) {
        parts.push('-')
      }
      if (['Max.', 'Range'].includes(this.typeUnit.label.en)) {
        parts.push(this.countMax)
      }
      parts.push(('' + localization.getLocalLabel(this.countUnit.label, locale, 'lowercase')))
      return parts.join(' ')
    },
    hasSource: true,
    preSave: function () {
      this.count = parseInt(this.count) || 0
      this.countMin = parseInt(this.countMin) || 0
      this.countMax = parseInt(this.countMax) || 0
      $localStorage.defaults = $localStorage.defaults || {}
      $localStorage.defaults.birds = $localStorage.defaults.birds || {}
      $localStorage.defaults.birds.countUnit = this.countUnit
      $localStorage.defaults.birds.typeUnit = this.typeUnit
    },
    preCopy: function () {
      delete this.species
      delete this.confidential
      delete this.countUnit
      delete this.typeUnit
      delete this.typeNesting
      delete this.count
      delete this.countMin
      delete this.countMax
      delete this.sex
      delete this.age
      delete this.marking
      delete this.speciesStatus
      delete this.behaviour
      delete this.deadIndividualCauses
      delete this.substrate
      delete this.tree
      delete this.treeHeight
      delete this.treeLocation
      delete this.nestHeight
      delete this.nestLocation
      delete this.brooding
      delete this.eggsCount
      delete this.countNestling
      delete this.countFledgling
      delete this.countSuccessfullyLeftNest
      delete this.nestProtected
      delete this.ageFemale
      delete this.ageMale
      delete this.nestingSuccess
      delete this.landuse300mRadius
      delete this.speciesNotes
    },
    postCopy: function () {
      this.initDefaults()
    },
    initDefaults: function () {
      this.countUnit = (($localStorage.defaults || {}).birds || {}).countUnit
      this.typeUnit = (($localStorage.defaults || {}).birds || {}).typeUnit
      this.confidential = false
      this.moderatorReview = false
    },
    hasNotes: true
  })

  // class methods
  angular.extend(FormBirds, {})

  LocalCache.inject(FormBirds, {
    name: 'birds'
  })

  return FormBirds
})
