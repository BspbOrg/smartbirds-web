const languages = require('../../../config/languages')
const angular = require('angular')
require('../app').controller('NomenclaturesController', /* @ngInject */function (
  db, Nomenclature, $scope, $state, $stateParams, $translate) {
  const $ctrl = this

  $ctrl.page = 1
  $ctrl.pageSize = 10
  $ctrl.nomenclatures = db.nomenclatures

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

  $ctrl.groups = {}
  angular.forEach(db.nomenclatures, function (nomenclature, key) {
    const parts = key.split('_')
    const group = parts.shift()
    const name = parts.join('_')
    $ctrl.groups[group] = $ctrl.groups[group] || {}
    $ctrl.groups[group][name] = nomenclature

    if (group === $stateParams.group && name === $stateParams.nomenclature) {
      $ctrl.selected = $ctrl.selected || {}
      $ctrl.selected.group = $ctrl.selected.group || {}
      $ctrl.selected.group[group] = true
      $ctrl.selected.name = name
      $ctrl.selected.type = key
      $ctrl.selected.nomenclature = []
      angular.forEach(nomenclature, function (item) {
        $ctrl.selected.nomenclature.push(angular.copy(item))
      })
    }
  })

  $ctrl.pageChanged = function () {
    const start = ($ctrl.page - 1) * $ctrl.pageSize
    $ctrl.visible = $ctrl.selected.nomenclature.slice(start, start + $ctrl.pageSize)
  }
  if ($ctrl.selected && $ctrl.selected.nomenclature) {
    $ctrl.pageChanged()
  }

  $ctrl.remove = function (idx) {
    $ctrl.selected.nomenclature.splice(idx, 1)
    $scope.editform.$setDirty()
  }

  $ctrl.add = function (key) {
    $ctrl.selected.nomenclature.push(new Nomenclature({
      type: $ctrl.selected.type
    }))
    $scope.editform.$setDirty()
  }

  $ctrl.save = function () {
    if ($scope.editform.$invalid) return
    if (!$ctrl.selected.nomenclature.length) {
      return
    }
    Nomenclature.updateGroup({ type: $ctrl.selected.type }, { items: $ctrl.selected.nomenclature })
      .$promise.then(function (items) {
        $scope.editform.$setPristine()
        db.$updateNomenclatures()
      })
  }
})
