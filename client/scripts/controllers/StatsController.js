require('../app').controller('StatsController', /* @ngInject */function ($scope, $state, $translate, api, form, localization, prefix, user, stats) {
  const controller = this
  controller.form = form
  controller.translationPrefix = prefix
  controller.selectedDate = new Date()

  controller.tab = 'interesting'

  Object.entries(stats).forEach(([key, fn]) => {
    api.stats[fn]().then((stats) => {
      controller[key] = stats
    })
  })

  controller.filters = {
    date: (targetDate) => (record) => {
      return targetDate && record.date.split('T').shift() === new Date(targetDate).toISOString().split('T').shift()
    },
    migrationPoint: (migrationPoint) => (record) => {
      if (!migrationPoint) return true
      for (const lang in record.migrationPoint.label) {
        if (record.migrationPoint.label[lang] === migrationPoint) return true
      }
      return false
    },
    species: (species) => (record) => {
      if (!species) return true
      for (const lang in record.species.label) {
        if (record.species.label[lang] === species) return true
      }
      return false
    }
  }

  const cache = {}
  controller.uniqueLocalLabel = function (list, field) {
    cache[$translate.$language] = cache[$translate.$language] || {}
    cache[$translate.$language][field] = cache[$translate.$language][field] || {}
    if (cache[$translate.$language][field][list]) return cache[$translate.$language][field][list]

    const result = Object.keys((list || []).reduce((acc, record) => {
      acc[localization.getLocalLabel(record[field].label)] = true
      return acc
    }, {})).filter(Boolean).sort((a, b) => a.localeCompare(b))

    cache[$translate.$language][field][list] = result
    return result
  }

  controller.generateInterestingSpeciesUrl = function (record) {
    const formName = record.form || controller.form
    return $state.href('auth.monitoring.public.' + formName, {
      user: record.observer && record.observer.id,
      species: record.species.label.la,
      from_date: record.date,
      to_date: record.date,
      tab: 'map'
    })
  }

  controller.generateTopSpeciesUrl = function (record) {
    const fromDate = new Date()
    fromDate.setMonth(fromDate.getMonth() - 1)
    return $state.href('auth.monitoring.public.' + controller.form, {
      species: record.species.label.la,
      from_date: fromDate,
      tab: 'map'
    })
  }

  controller.generateTopUserUrl = function (record) {
    const fromDate = new Date()
    fromDate.setMonth(0)
    fromDate.setDate(1)
    return $state.href('auth.monitoring.public.' + controller.form, {
      user: record.user.id,
      from_date: fromDate,
      tab: 'map'
    })
  }

  controller.userRecordsPosition = function () {
    const userRank = controller.userRanks[user.getIdentity().id] && controller.userRanks[user.getIdentity().id][controller.form]
    return userRank && userRank.records.position ? userRank.records.position : '--'
  }

  controller.userRecordsCount = function () {
    const userRank = controller.userRanks[user.getIdentity().id] && controller.userRanks[user.getIdentity().id][controller.form]
    console.log(userRank)
    return userRank && userRank.records.count ? userRank.records.count : '0'
  }

  controller.userSpeciesPosition = function () {
    const userRank = controller.userRanks[user.getIdentity().id] && controller.userRanks[user.getIdentity().id][controller.form]
    return userRank && userRank.species.position ? userRank.species.position : '--'
  }

  controller.userSpeciesCount = function () {
    const userRank = controller.userRanks[user.getIdentity().id] && controller.userRanks[user.getIdentity().id][controller.form]
    return userRank && userRank.species.count ? userRank.species.count : '0'
  }
})
