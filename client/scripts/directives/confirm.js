require('../app').directive('confirm', /* @ngInject */function () {
  return {
    priority: -10,
    require: 'confirm',
    link: function ($scope, $element, $attrs, $ctrl) {
      $element.on('click', $ctrl.confirm)
    },
    controller: /* @ngInject */function ($attrs, $element, $scope, $uibModal) {
      var $ctrl = this

      $ctrl.confirm = function (event) {
        if (event.confirmed) return

        event.preventDefault()
        event.stopImmediatePropagation()

        var size = $attrs.confirmSize || 'sm'
        var modalScope = $scope.$new(true)
        modalScope.message = $attrs.confirm

        modalScope.confirmation = {
          confirmText: $attrs.confirmText || '',
          confirmedText: ''
        }

        var modalInstance = $uibModal.open({
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: '/views/system/confirm-dialog.html',
          size: size,
          scope: modalScope
        })

        modalInstance.result.then(function () {
          setTimeout(function () {
            $element.triggerHandler({ type: 'click', confirmed: true })
          })
        })
      }
    }
  }
})
