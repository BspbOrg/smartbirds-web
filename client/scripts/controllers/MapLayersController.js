const languages = require('../../../config/languages')
const angular = require('angular')
require('../app').controller('MapLayersController', /* @ngInject */function (
  db, MapLayer, $scope, $state, $stateParams, $translate) {
  const $ctrl = this

  $ctrl.page = 1
  $ctrl.pageSize = 10
  $ctrl.mapLayers = db.mapLayers

  $ctrl.currentLanguage = $translate.$language || 'en'
  $ctrl.languages = languages
  $ctrl.visibleLanguages = { en: languages.en }
  Object.defineProperty($ctrl, 'visibleLanguagesCount', {
    get () {
      return Object.keys($ctrl.visibleLanguages).length
    }
  })
  $ctrl.visibleLanguages[$ctrl.currentLanguage] = languages[$ctrl.currentLanguage]
  $ctrl.languageSelectorIsOpen = false
  $ctrl.setCurrentLanguage = function (key, $event) {
    if ($event) {
      $event.preventDefault()
      $event.stopPropagation()
    }
    $ctrl.languageSelectorIsOpen = false
    $ctrl.currentLanguage = key
    if (key) {
      $ctrl.visibleLanguages = { en: languages.en }
      $ctrl.visibleLanguages[$ctrl.currentLanguage] = languages[$ctrl.currentLanguage]
    } else {
      $ctrl.visibleLanguages = languages
    }
  }

  if ($stateParams.type && $stateParams.type in db.mapLayers) {
    $ctrl.selected = $ctrl.selected || {}
    $ctrl.selected.type = $stateParams.type
    $ctrl.selected.mapLayers = []
    angular.forEach(db.mapLayers[$stateParams.type], function (item) {
      $ctrl.selected.mapLayers.push(angular.copy(item))
    })
  }

  $ctrl.pageChanged = function () {
    const start = ($ctrl.page - 1) * $ctrl.pageSize
    $ctrl.visible = $ctrl.selected.mapLayers.slice(start, start + $ctrl.pageSize)
  }
  if ($ctrl.selected && $ctrl.selected.mapLayers) {
    $ctrl.pageChanged()
  }

  $ctrl.remove = function (idx) {
    const start = ($ctrl.page - 1) * $ctrl.pageSize
    $ctrl.selected.mapLayers.splice(start + idx, 1)
    if (start >= $ctrl.selected.mapLayers.length && $ctrl.page > 0) {
      $ctrl.page--
    }
    $ctrl.pageChanged()
    $scope.editform.$setDirty()
  }

  $ctrl.add = function (key) {
    const len = $ctrl.selected.mapLayers.push(new $ctrl.selected.constructor({
      type: $ctrl.selected.type
    }))
    $ctrl.page = Math.ceil(len / $ctrl.pageSize)
    $ctrl.pageChanged()
    $scope.editform.$setDirty()
  }

  $ctrl.save = function () {
    if ($scope.editform.$invalid) return
    if (!$ctrl.selected.mapLayers.length) {
      return
    }
    MapLayer.updateGroup({ type: $ctrl.selected.type }, { items: $ctrl.selected.mapLayers })
      .$promise.then(function (items) {
        $scope.editform.$setPristine()
        db.$updateMapLayers()
      })
  }
})
