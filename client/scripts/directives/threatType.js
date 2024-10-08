require('../app')
/**
 * A helper directive to display a threat record primary type and subtype
 */
  .directive('threatType', /* @ngInject */function () {
    return {
      restrict: 'E',
      template: [
        '<config-label config="threatsPrimaryTypes" value="{{::record.primaryType}}"></config-label> - ',
        '<span ng-if="::record.category">{{::getLocalLabel(record.category.label)}}</span>',
        '<config-label ng-if="::record.poisonedType" config="threatsPoisonedType" value="{{::record.poisonedType}}"></config-label>'
      ].join(' '),
      scope: {
        record: '<'
      },
      controller: /* @ngInject */function ($scope, localization) {
        $scope.getLocalLabel = localization.getLocalLabel
      }
    }
  })
