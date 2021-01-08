require('../app').directive('dashboardFormCard', /* @ngInject */function () {
  return {
    restrict: 'E',
    templateUrl: '/views/directives/dashboardFormCard.html',
    scope: {
      form: '<'
    },
    bindToController: true,
    controller: /* @ngInject */function () {
      const $ctrl = this

      $ctrl.load = function () {
        $ctrl.status = 'primary'
        $ctrl.loading = true
        $ctrl.error = false
        $ctrl.form.modelRef.countPendingReview()
          .$promise
          .then(
            function (data) {
              $ctrl.pendingReview = data.count
              if ($ctrl.pendingReview > 0) {
                $ctrl.status = 'warning'
              } else {
                $ctrl.status = 'primary'
              }
            },
            function () {
              $ctrl.error = true
              $ctrl.status = 'danger'
            }
          )
          .finally(function () {
            $ctrl.loading = false
          })
      }

      $ctrl.$onInit = function () {
        $ctrl.load()
      }
    },
    controllerAs: '$ctrl'
  }
})
