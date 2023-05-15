const Odometer = require('odometer')

require('../app').directive('sbOdometer', /* @ngInject */function () {
  return {
    restrict: 'AE',
    scope: { value: '=' },
    link: function (scope, element) {
      const odometer = new Odometer({
        el: element[0],
        value: 0,
        format: 'dd,ddd,dddd',
        duration: 2000,
        animation: 'count'
      })

      scope.$watch('value', function (value) {
        odometer.update(parseInt(value) * 10)
      })
    }
  }
})
