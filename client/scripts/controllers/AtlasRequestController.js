var selectedColor = '#3c3'
var selectedOpacityFill = 0.65
var selectedOpacityStroke = 1
var unselectedColor = function (percent) {
  if (percent < 30) {
    return '#a33'
  }
  if (percent < 65) {
    return '#838'
  }
  return '#33a'
}
var unselectedOpacityFill = function (percent) {
  return percent < 30 ? 0.8 : percent < 80 ? 1.1 - percent / 100 : 0.3
}

var unselectedOpacityStroke = function (percent) {
  return percent < 30 ? 0.8 : percent < 80 ? 1.1 - percent / 100 : 0.3
}

require('../app')
  .controller('AtlasRequestController', /* @ngInject */function (api, ngToast, $state, $translate, user) {
    var $ctrl = this

    $ctrl.MAX = 10

    $ctrl.map = {
      state: {
        bounds: {
          northeast: {
            latitude: 44.44350031073804,
            longitude: 29.21416050689999
          },
          southwest: {
            latitude: 40.91718468273068,
            longitude: 21.21611363189999
          }
        },
        center: {
          // TODO: extract to config
          latitude: 42.70537387439325, longitude: 25.2151370694
        },
        dragging: false,
        zoom: 7
      },
      options: {
        maxZoom: 15
      }
    }

    $ctrl.cells = []
    api.bgatlas2008.userGrid().then(function (cells) {
      $ctrl.cells = cells.map(function (cell) {
        var percent = cell.spec_old > 0 ? 100.0 * cell.spec_known / cell.spec_old : 0
        var model = {
          id: cell.utm_code,
          percent: percent,
          fill: { color: unselectedColor(percent), opacity: unselectedOpacityFill(percent) },
          stroke: { color: unselectedColor(percent), opacity: unselectedOpacityStroke(percent), weight: 1 },
          coordinates: cell.coordinates,
          cell: cell
        }
        if (user.getIdentity().bgatlasCells && user.getIdentity().bgatlasCells.some(function (c) {
          return c.utm_code === model.id
        })) {
          $ctrl.select(model)
        }
        return model
      })
    })

    $ctrl.selected = []

    $ctrl.unselect = function (selectedIdx) {
      if (!(selectedIdx in $ctrl.selected)) {
        return
      }
      var model = $ctrl.selected[selectedIdx]
      $ctrl.selected.splice(selectedIdx, 1)
      model.stroke.color = unselectedColor(model.percent)
      model.stroke.opacity = unselectedOpacityStroke(model.percent)
      model.fill.color = unselectedColor(model.percent)
      model.fill.opacity = unselectedOpacityFill(model.percent)
    }

    $ctrl.select = function (model) {
      $ctrl.selected.push(model)
      model.stroke.color = selectedColor
      model.stroke.opacity = selectedOpacityStroke
      model.fill.color = selectedColor
      model.fill.opacity = selectedOpacityFill
    }

    $ctrl.events = {
      click: function (poly, event, model, args) {
        var selectedIdx = $ctrl.selected.indexOf(model)
        if (selectedIdx !== -1) {
          $ctrl.unselect(selectedIdx)
        } else {
          $ctrl.select(model)
        }
      }
    }

    $ctrl.save = function () {
      api.bgatlas2008.setSelected($ctrl.selected.map(function (model) { return model.id }))
        .then(function () {
          var identity = user.getIdentity()
          identity.bgatlasCells = $ctrl.selected.map(function (model) {
            return model.cell
          })
          user.setIdentity(identity)

          $state.go('auth.dashboard')
        })
        .then(function (res) {
          ngToast.create({
            className: 'success',
            content: $translate.instant('Saved successfully')
          })
        })
        .catch(function (error) {
          ngToast.create({
            className: 'danger',
            content: '<p>' + $translate.instant('Error while saving') + '</p><pre>' + (error && error.data ? error.data.error : JSON.stringify(error, null, 2)) + '</pre>'
          })
        })
    }
  })
