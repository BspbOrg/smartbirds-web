require('../app').controller('MobileStatsController', /* @ngInject */function ($scope, $state, $q, api) {
  var controller = this

  controller.forms = ['birds', 'herptiles', 'mammals', 'plants', 'invertebrates']

  $q.all(controller.forms.map(function (form) {
    return api.stats[form + '_top_stats']().then(function (res) {
      var stats = {}
      stats[form] = res.interesting_species
      return stats
    })
  })).then(function (result) {
    controller.stats = result.reduce(function (res, current) {
      return Object.assign(res, current)
    })
  }).catch(function (err) {
    console.log(err)
  })
})