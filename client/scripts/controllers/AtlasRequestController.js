var selectedColor = '#3c3'
var unselectedColor = '#555'

require('../app')
  .controller('AtlasRequestController', /* @ngInject */function (api) {
    var $ctrl = this

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
    api.gridCells('test-bg-utm10').then(function (cells) {
      $ctrl.cells = cells.map(function (cell, idx) {
        return {
          id: cell.cellId,
          fill: { color: unselectedColor, opacity: 0.3 },
          stroke: { color: unselectedColor, opacity: 0.8, weight: 1 },
          coordinates: cell.vertexes.map(function (v) {
            return {
              latitude: v.lat,
              longitude: v.lon
            }
          })
        }
      })
    })

    $ctrl.selected = []

    $ctrl.events = {
      click: function (poly, event, model, args) {
        var selectedIdx = $ctrl.selected.indexOf(model)
        if (selectedIdx !== -1) {
          $ctrl.selected.splice(selectedIdx, 1)
          model.stroke.color = unselectedColor
          model.fill.color = unselectedColor
        } else {
          $ctrl.selected.push(model)
          model.stroke.color = selectedColor
          model.fill.color = selectedColor
        }
      }
    }
  })
