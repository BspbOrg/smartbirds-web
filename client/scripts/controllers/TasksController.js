var forms = require('../configs/forms')
require('../app').controller('TasksController', /* @ngInject */function (api) {
  var $ctrl = this

  $ctrl.forms = forms

  $ctrl.autoLocation = function (form, id) {
    delete $ctrl.autoLocation.response
    delete $ctrl.autoLocation.error
    $ctrl.autoLocation.loading = true
    api.tasks.autoLocation(form, id).then(function (response) {
      $ctrl.autoLocation.response = response.data.result
    }, function (error) {
      $ctrl.autoLocation.error = error.data.error
    }).finally(function () {
      delete $ctrl.autoLocation.loading
    })
  }
})
