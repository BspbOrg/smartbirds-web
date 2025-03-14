const forms = require('../configs/forms')
const moment = require('moment')

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

  $ctrl.ebpUpload = function (startDate, endDate, mode, bulk) {
    delete $ctrl.ebpUpload.response
    delete $ctrl.ebpUpload.error
    if (!startDate) {
      $ctrl.ebpUpload.error = 'Please select a start date'
      return
    }
    if (!endDate) {
      $ctrl.ebpUpload.error = 'Please select an end date'
      return
    }
    if (endDate && moment(endDate).isBefore(moment(startDate))) {
      $ctrl.ebpUpload.error = 'End date must be after start date'
      return
    }

    $ctrl.ebpUpload.loading = true
    const startDateNormalized = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0))
    const endDateNormalized = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999))
    api.tasks.ebpUpload(startDateNormalized, endDateNormalized, mode, bulk).then(function (response) {
      $ctrl.ebpUpload.response = response.data.result
    }, function (error) {
      $ctrl.ebpUpload.error = error.data.error
    }).finally(function () {
      delete $ctrl.ebpUpload.loading
    })
  }
})
