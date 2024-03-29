/**
 * Created by groupsky on 11.01.16.
 */
const angular = require('angular')
const moment = require('moment')
const formsConfig = require('../../../config/formsConfig')

function watchBoolAttribute ($attrs, $scope, $parse, field) {
  return function (attribute) {
    if (attribute in $attrs) {
      if (angular.isDefined($attrs[attribute])) {
        const getter = $parse($attrs[attribute]).bind(null, $scope.$parent)
        $scope.$on('$destroy', $scope.$parent.$watch(getter, function (value) {
          field[attribute] = value
        }))
      } else {
        field[attribute] = true
      }
    } else {
      field[attribute] = false
    }
  }
}

require('../app').directive('field', /* @ngInject */function ($q, api, Raven, geolocation) {
  let cnt = 0
  return {
    restrict: 'AE',
    scope: {
      name: '@?',
      label: '@?',
      labelXs: '@?',
      labelSm: '@?',
      labelMd: '@?',
      labelLg: '@?',
      placeholder: '@?',
      help: '@?',
      model: '=',
      nomenclature: '@?',
      select: '&?onSelect',
      match: '=?',
      format: '=?',
      context: '@?',
      config: '@?'
    },
    bindToController: true,
    require: '^form',
    templateUrl: function ($element, $attrs) {
      return '/views/fields/' + ($attrs.type || 'general').split('.', 2)[0] + '.html'
    },
    link: function ($scope, $element, $attrs, formCtrl) {
      $scope.form = formCtrl
    },
    controllerAs: 'field',
    controller: /* @ngInject */function ($scope, $attrs, $filter, $parse, $rootElement, $timeout, $translate, Nomenclature, Species, db, Organization) {
      const field = this

      field.$onInit = function () {
        while (!field.name || $rootElement.querySelectorAll('#' + field.name).length) {
          field.name = 'field' + ($attrs.type ? '_' + $attrs.type : '') + (cnt++)
        }

        $scope.$watch('form', function (form) {
          field.form = form
        })
        field.$attrs = $attrs
        field.type = ($attrs.type || 'general').split('.', 2)[0]
        field.subtypes = ($attrs.type || 'general').split('.').slice(1)
        field.required = angular.isDefined($attrs.required)
        field.readonly = 'readonly' in $attrs ? $attrs.$attr.readonly === 'readonly' || (angular.isDefined($attrs.readonly) ? $parse($attrs.readonly)($scope.$parent) : true) : false
        field.hasGeolocation = geolocation.isAvailable
        field.loading = false
        field.autocomplete = $attrs.autocomplete

        const boolAttribWatcher = watchBoolAttribute($attrs, $scope, $parse, field)
        boolAttribWatcher('autofill')
        boolAttribWatcher('disabled')

        field.order = function (item) {
          return item && item.toString().replace(/\d+/g, function (digits) {
            return ((new Array(20).join('0')) + digits).substr(-20, 20)
          })
        }

        field.onSelect = function (args) {
          if (!args) {
            args = {}
          } else if (!angular.isObject(args)) {
            args = { $arg: args }
          }
          $timeout(function () {
            if (angular.isFunction(field.select)) {
              field.select(angular.extend({}, args, { model: field.model }))
            }
          })
        }

        const getCurrentPositionSuccess = function (pos) {
          if (!pos || !pos.coords) return
          const args = {
            timestamp: pos.timestamp,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          }
          field.subtypes.forEach(function (subtype) {
            if (subtype in args) {
              $timeout(function () {
                field.model = args[subtype]
              })
            }
          })
          field.onSelect(args)
        }

        const getCurrentPositionError = function (err) {
          Raven.captureMessage(JSON.stringify(err))
        }

        field.getCurrentLocation = function () {
          if (!geolocation.isAvailable) return
          field.loading = true
          geolocation.requestCurrentLocation()
            .then(getCurrentPositionSuccess, getCurrentPositionError)
            .finally(function () {
              field.loading = false
            })
        }

        switch (field.type) {
          case 'bool': {
            field.labels = {
              true: $attrs.labelTrue,
              false: $attrs.labelFalse
            }
            field.values = {
              true: $attrs.valueTrue != null ? $attrs.valueTrue : true,
              false: $attrs.valueFalse != null ? $attrs.valueFalse : false
            }
            break
          }
          case 'date':
          case 'time': {
            $scope.$watch('field.model', function () {
              if (angular.isString(field.model)) {
                field.model = moment(field.model).toDate()
              }
            })
            break
          }
          case 'species':
          case 'multiple-species': {
            $scope.$watch('field.nomenclature', function () {
              field.values = []
              angular.forEach(db.species[field.nomenclature], function (item) {
                field.values.push(item)
              })
            })

            $scope.$watch('field.model', function () {
              if (field.model) {
                if (angular.isArray(field.model)) {
                  field.model.forEach(function (item, idx, array) {
                    if (angular.isObject(item) && !(item instanceof Species)) {
                      array[idx] = db.species[field.nomenclature][item.label.en] || new Species(item)
                    }
                  })
                } else if (angular.isObject(field.model)) {
                  if (!(field.model instanceof Species)) {
                    field.model = db.species[field.nomenclature][field.model.label.en] || new Species(field.model)
                  }
                }
              }
            })

            break
          }
          case 'user': {
            field.values = []
            angular.forEach(field.context === 'public' ? db.publicUsers : db.users, function (item) {
              field.values.push(item)
            })
            break
          }
          case 'location': {
            field.values = []
            angular.forEach(db.locations, function (item) {
              field.values.push(item)
            })
            break
          }
          case 'autocomplete': {
            field.load = function (q) {
              return api.autocomplete({ q, type: field.subtypes })
            }
            break
          }
          case 'single-choice':
          case 'multiple-choice': {
            field.values = []
            angular.forEach(db.nomenclatures[field.nomenclature], function (item) {
              field.values.push(item)
            })

            $scope.$watch('field.model', function () {
              if (field.model) {
                if (angular.isArray(field.model)) {
                  field.model.forEach(function (item, idx, array) {
                    if (angular.isObject(item) && !(item instanceof Nomenclature)) {
                      array[idx] = db.nomenclatures[field.nomenclature][item.label.en] || new Nomenclature(item)
                    }
                  })
                } else if (angular.isObject(field.model)) {
                  if (!(field.model instanceof Nomenclature)) {
                    field.model = db.nomenclatures[field.nomenclature][field.model.label.en] || new Nomenclature(field.model)
                  }
                } else if (typeof field.model === 'string') {
                  field.model = db.nomenclatures[field.nomenclature][field.model] || new Nomenclature({ label: { en: field.model } })
                }
              }
            })

            break
          }
          case 'zone': {
            field.values = []
            angular.forEach(db.zones, function (zone) {
              if (zone.status !== 'owned') return
              field.values.push(zone)
            })
            field.values.sort(function (a, b) {
              return a.id < b.id ? -1 : a.id > b.id ? +1 : 0
            })
            break
          }

          case 'select':
          case 'checkbox-group':
          case 'single-choice-button': {
            // set viewModel as empty string for default value, otherwise typeahead filter is not working
            field.viewModel = ''
            $scope.$watch('field.model', function () {
              if (field.model == null || field.model === '') {
                field.viewModel = ''
                return
              }

              for (const key in field.values) {
                if (field.values[key].id === field.model) {
                  field.viewModel = field.values[key].label
                  break
                }
              }
            })

            const updateValues = function (fieldValues) {
              field.values = fieldValues.map(function (el) {
                if (typeof el !== 'object') {
                  el = {
                    id: el,
                    label: el
                  }
                }

                if (el.id === field.model) {
                  field.viewModel = el.label
                }

                $translate(el.label).then(function (val) {
                  el.label = val
                }).catch(angular.noop)
                el.label = $translate.instant(el.label)
                return el
              })
            }

            if ($attrs.config) {
              if (!($attrs.config in formsConfig)) {
                throw new Error('Unsupported config type: "' + $attrs.config + '"\nAvailable values are: ' + Object.keys(formsConfig).join(', '))
              }
              updateValues(Object.values(formsConfig[$attrs.config]).map(function (el) {
                return {
                  id: el.id,
                  label: el.label
                }
              }))
            } else {
              const expr = $parse($attrs.choices)
              $scope.$on('$destroy', $scope.$parent.$watch(function () {
                return expr($scope.$parent)
              }, function (newValue) {
                updateValues(newValue)
              }))
            }

            break
          }
          case 'geolocation': {
            var unregisterAutofillWatcher = $scope.$watch('field.autofill', function (autofill) {
              if (field.autofill && geolocation.isAvailable && geolocation.canCheckAllowed && field.model == null) {
                field.loading = true
                geolocation.checkAllowed()
                  .then(function (allowed) {
                    if (!allowed) return
                    geolocation.requestCurrentLocation()
                      .then(function (pos) {
                        if (field.autofill && field.model == null) {
                          unregisterAutofillWatcher()
                          return getCurrentPositionSuccess(pos)
                        }
                      })
                      .finally(function () {
                        field.loading = false
                      })
                  })
                  .finally(function () {
                    field.loading = false
                  })
              }
            })

            break
          }
          case 'organization': {
            field.values = []
            angular.forEach(db.organizations, function (item) {
              field.values.push(item)
            })

            // set viewModel as empty string for default value, otherwise typeahead filter is not working
            $scope.$watch('field.model', function () {
              if (field.model) {
                if (!(field.model instanceof Organization)) {
                  field.viewModel = db.organizations[field.model] || new Organization(field.model)
                }
              } else {
                field.viewModel = ''
              }
            })

            break
          }
        }
      }
    }
  }
})
