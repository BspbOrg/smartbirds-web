/**
 * Created by groupsky on 01.04.16.
 */

var angular = require('angular')
var extend = require('angular').extend
var moment = require('moment')
var languages = require('../../../config/languages')
var capitalizeFirstLetter = require('../utils/capitalizeFirstLetter')

function strCompare (a, b) {
  return a < b ? -1 : 1
}

require('../app').directive('homeMap', /* @ngInject */function () {
  var lastModel
  return {
    restrict: 'AE',
    templateUrl: function (elem, attr) {
      return '/views/directives/homemap/' + attr.form + '.html'
    },
    scope: {
      form: '@'
    },
    controller: /* @ngInject */function ($scope, $q, $translate, api) {
      var vc = extend(this, {
        center: { latitude: 42.744820608, longitude: 25.2151370694 },
        zoom: 8,
        records: [],
        filteredRecords: [],
        options: {
          maxZoom: 15,
          streetViewControl: false
        },
        marker: {
          click: function (marker, eventName, model) {
            if (lastModel && lastModel !== model) lastModel.show = !lastModel.show
            model.show = !model.show
            vc.activeModel = lastModel = model
          }
        },
        windowOptions: {
          pixelOffset: { width: 0, height: -25 }
        },
        filters: {
          current: {},
          options: {},
          getLocalThreatOptions: function () {
            return vc.filters.options['threats' + capitalizeFirstLetter($translate.$language)]
          },
          updated: function () {
            vc.filteredRecords = vc.records.filter(function (item) {
              switch ($scope.form) {
                case 'threats':
                  if (vc.filters.current.threat) {
                    if (item.threatsEn !== vc.filters.current.threat &&
                      item['threats' + capitalizeFirstLetter($translate.$language)] !== vc.filters.current.threat) {
                      return false
                    }
                  }
                  if (vc.filters.current.observationDateTime) {
                    if (moment(item.observationDateTime).add(vc.filters.current.observationDateTime, 'months').isBefore()) {
                      return false
                    }
                  }
                  break
              }
              return true
            })
          }
        }
      })

      api.stats[$scope.form + '_stats']().then(function (records) {
        vc.records = vc.filteredRecords = records
        switch ($scope.form) {
          case 'threats':
            Object.keys(languages).forEach(function (language) {
              vc.filters.options['threats' + capitalizeFirstLetter(language)] = {}
            })
            break
        }

        angular.forEach(records, function (record) {
          record.id = record.id || ('' + record.latitude + record.longitude)
          switch ($scope.form) {
            case 'threats':
              Object.keys(languages).forEach(function (language) {
                var k = 'threats' + capitalizeFirstLetter(language)
                vc.filters.options[k][record[k] || record.threatsEn] = true
              })
              break
          }
        })

        switch ($scope.form) {
          case 'threats':
            Object.keys(languages).forEach(function (language) {
              var k = 'threats' + capitalizeFirstLetter(language)
              vc.filters.options[k] = Object.keys(vc.filters.options[k]).sort(strCompare)
            })
            break
        }
      })
    },
    controllerAs: 'map'
  }
})
