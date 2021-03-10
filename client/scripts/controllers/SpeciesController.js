const languages = require('../../../config/languages')
const angular = require('angular')
require('../app').controller('SpeciesController', /* @ngInject */function (
  db, $scope, Species, $state, $stateParams, $translate) {
  const $ctrl = this

  $ctrl.page = 1
  $ctrl.pageSize = 10
  $ctrl.species = db.species

  $ctrl.currentLanguage = $translate.$language || 'en'
  $ctrl.languages = languages
  $ctrl.visibleLanguages = { en: languages.en }
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

  if ($stateParams.type && $stateParams.type in db.species) {
    $ctrl.selected = $ctrl.selected || {}
    $ctrl.selected.type = $stateParams.type
    $ctrl.selected.species = []
    angular.forEach(db.species[$stateParams.type], function (item) {
      $ctrl.selected.species.push(angular.copy(item))
    })
  }

  $ctrl.pageChanged = function () {
    const start = ($ctrl.page - 1) * $ctrl.pageSize
    $ctrl.visible = $ctrl.selected.species.slice(start, start + $ctrl.pageSize)
  }
  if ($ctrl.selected && $ctrl.selected.species) {
    $ctrl.pageChanged()
  }

  $ctrl.remove = function (idx) {
    const start = ($ctrl.page - 1) * $ctrl.pageSize
    $ctrl.selected.species.splice(start + idx, 1)
    if (start >= $ctrl.selected.species.length && $ctrl.page > 0) {
      $ctrl.page--
    }
    $ctrl.pageChanged()
    $scope.editform.$setDirty()
  }

  $ctrl.add = function (key) {
    const len = $ctrl.selected.species.push(new Species({
      type: $ctrl.selected.type
    }))
    $ctrl.page = Math.ceil(len / $ctrl.pageSize)
    $ctrl.pageChanged()
    $scope.editform.$setDirty()
  }

  $ctrl.save = function () {
    if ($scope.editform.$invalid) return
    if (!$ctrl.selected.species.length) {
      return
    }
    Species.updateGroup({ type: $ctrl.selected.type }, { items: $ctrl.selected.species })
      .$promise.then(function (items) {
        $scope.editform.$setPristine()
        db.$updateSpecies()
      })
  }
})
