const forms = require('../configs/forms')
require('../app').controller('TasksController', /* @ngInject */function (api) {
  const $ctrl = this

  $ctrl.forms = forms

  Object.keys(api.tasks).forEach(function (task) {
    $ctrl[task] = function (form, id, limit, force) {
      delete $ctrl[task].response
      delete $ctrl[task].error
      $ctrl[task].loading = true
      api.tasks[task](form, id, limit, force).then(function (response) {
        $ctrl[task].response = response.data.result
      }, function (error) {
        $ctrl[task].error = error.data.error
      }).finally(function () {
        delete $ctrl[task].loading
      })
    }
  })
})
