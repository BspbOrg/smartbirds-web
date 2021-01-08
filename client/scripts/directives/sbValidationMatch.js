/**
 * Created by groupsky on 12.01.16.
 */
const angular = require('angular')

require('../app').directive('sbValidationMatch', /* @ngInject */function ($parse) {
  return {
    require: '?ngModel',
    restrict: 'A',
    link: function (scope, elem, attrs, ctrl) {
      if (!ctrl) {
        if (console && console.warn) {
          console.warn('Match validation requires ngModel to be on the element')
        }
        return
      }

      const matchGetter = $parse(attrs.sbValidationMatch)
      const caselessGetter = $parse(attrs.sbValidationMatchCaseless)
      const noMatchGetter = $parse(attrs.sbValidationNotMatch)

      scope.$watch(getMatchValue, function () {
        ctrl.$$parseAndValidate()
      })

      ctrl.$validators.match = function () {
        const match = getMatchValue()
        const notMatch = noMatchGetter(scope)
        let value

        if (caselessGetter(scope)) {
          value = String(ctrl.$viewValue).toLocaleLowerCase() === String(match).toLocaleLowerCase()
        } else {
          value = ctrl.$viewValue === match
        }
        value ^= notMatch
        return !!value
      }

      function getMatchValue () {
        let match = matchGetter(scope)
        if (angular.isObject(match) && Object.hasOwnProperty.call(match, '$viewValue')) {
          match = match.$viewValue
        }
        return match
      }
    }
  }
})
