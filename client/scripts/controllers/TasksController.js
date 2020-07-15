var forms = require('../configs/forms')
require('../app').controller('TasksController', /* @ngInject */function (api) {
  var $ctrl = this

  $ctrl.forms = forms

  $ctrl.autoLocation = function (form, id, limit, force) {
    delete $ctrl.autoLocation.response
    delete $ctrl.autoLocation.error
    $ctrl.autoLocation.loading = true
    api.tasks.autoLocation(form, id, limit, force).then(function (response) {
      $ctrl.autoLocation.response = response.data.result
    }, function (error) {
      $ctrl.autoLocation.error = error.data.error
    }).finally(function () {
      delete $ctrl.autoLocation.loading
    })
  }

  $ctrl.bgatlas2008 = function (form, id, limit, force) {
    delete $ctrl.bgatlas2008.response
    delete $ctrl.bgatlas2008.error
    $ctrl.bgatlas2008.loading = true
    api.tasks.bgatlas2008(form, id, limit, force).then(function (response) {
      $ctrl.bgatlas2008.response = response.data.result
    }, function (error) {
      $ctrl.bgatlas2008.error = error.data.error
    }).finally(function () {
      delete $ctrl.bgatlas2008.loading
    })
  }
})
