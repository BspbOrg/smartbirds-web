/**
 * Created by groupsky on 01.04.16.
 */

const angular = require('angular')
const extend = require('angular').extend
const moment = require('moment')
const languages = require('../../../config/languages')
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter')

function strCompare (a, b) {
  return a < b ? -1 : 1
}

require('../app').directive('homeMap', /* @ngInject */function () {
  let lastModel
  return {
    restrict: 'AE',
    templateUrl: function (elem, attr) {
      return '/views/directives/homemap/' + attr.form + '.html'
    },
    scope: {
      form: '@'
    },
    controller: /* @ngInject */function ($scope, $q, $translate, api) {
      const vc = extend(this, {
        center: {
          latitude: 42.744820608,
          longitude: 25.2151370694
        },
        zoom: 8,
        records: [],
        filteredRecords: [],
        options: {
          maxZoom: 15
        },
        marker: {
          click: function (marker, eventName, model) {
            if (lastModel && lastModel !== model) lastModel.show = !lastModel.show
            model.show = !model.show
            vc.activeModel = lastModel = model
          },
          popupContent: function (model) {
            switch ($scope.form) {
              case 'threats':
                return '<div><h4 class="text-uppercase text-justify">' +
                  (model['threats' + capitalizeFirstLetter($translate.$language)] || model.threatsEn) +
                  '</h4></div>'
              case 'cbm':
                return '<div>' +
                  '<h6 class="text-uppercase text-justify"><small>' + $translate.instant('PUBLIC_CBM_MAP_ZONE') + '</small> ' + model.id + '</h6>' +
                  '<h6 class="text-uppercase text-justify"><small>' + $translate.instant('PUBLIC_CBM_MAP_USER') + '</small> ' + model.first_name + ' ' + model.last_name + '</h6>' +
                  '<h5 class="text-uppercase text-justify"><small>' + $translate.instant('PUBLIC_CBM_MAP_SPECIES') + '</small> ' + model.species_count + '</h5>' +
                  '<h5 class="text-uppercase text-justify"><small>' + $translate.instant('PUBLIC_CBM_MAP_INDIVIDUALS') + '</small> ' + model.units_count + '</h5>' +
                  '</div>'
              case 'birds':
                return '<div><h5 class="text-uppercase text-justify"><small>' +
                  $translate.instant('PUBLIC_BIRDS_MAP_SPECIES') + '</small> ' + model.species_count + '</h5></div>'
              default:
                return '<div>' +
                  '<h5 class="text-uppercase text-justify"><small>' + $translate.instant('PUBLIC_CBM_MAP_SPECIES') + '</small> ' + model.species_count + '</h5>' +
                  '<h5 class="text-uppercase text-justify"><small>' + $translate.instant('PUBLIC_CBM_MAP_INDIVIDUALS') + '</small> ' + model.units_count + '</h5>' +
                  '</div>'
            }
          }
        },
        windowOptions: {
          pixelOffset: {
            width: 0,
            height: -25
          }
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
                const k = 'threats' + capitalizeFirstLetter(language)
                vc.filters.options[k][record[k] || record.threatsEn] = true
              })
              break
          }
        })

        switch ($scope.form) {
          case 'threats':
            Object.keys(languages).forEach(function (language) {
              const k = 'threats' + capitalizeFirstLetter(language)
              vc.filters.options[k] = Object.keys(vc.filters.options[k]).sort(strCompare)
            })
            break
        }
      })
    },
    controllerAs: 'map'
  }
})
