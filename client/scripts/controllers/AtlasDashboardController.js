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
  .controller('AtlasDashboardController', /* @ngInject */function (api, ngToast, $state, $translate, user) {
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

    $ctrl.cells = (user.getIdentity().bgatlasCells || []).map(function (cell) {
      var percent = cell.spec_old > 0 ? 100.0 * cell.spec_known / cell.spec_old : 0
      var model = {
        id: cell.utm_code,
        percent: percent,
        fill: { color: unselectedColor(percent), opacity: unselectedOpacityFill(percent) },
        stroke: { color: unselectedColor(percent), opacity: unselectedOpacityStroke(percent), weight: 1 },
        coordinates: cell.coordinates,
        cell: cell
      }
      return model
    })

    $ctrl.selected = null

    $ctrl.events = {
      click: function (poly, event, model, args) {
        if (model === $ctrl.selected) {
          $ctrl.selected = null
        } else {
          $ctrl.selected = model
        }
      }
    }
  })
