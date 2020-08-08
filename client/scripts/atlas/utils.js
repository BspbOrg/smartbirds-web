var defaultBounds = {
  northeast: {
    latitude: 44.44350031073804,
    longitude: 29.21416050689999
  },
  southwest: {
    latitude: 40.91718468273068,
    longitude: 21.21611363189999
  }
}

var defaultCenter = {
  latitude: 42.70537387439325, longitude: 25.2151370694
}

var defaultZoom = 7

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

function mapCellToMapModel (cell, selected) {
  var percent = cell.spec_old > 0 ? 100.0 * cell.spec_known / cell.spec_old : 0
  var model = {
    id: cell.utm_code,
    percent: percent,
    coordinates: cell.coordinates,
    cell: cell
  }
  updateModelStyle(model, selected)
  return model
}

function updateModelStyle (model, selected) {
  model.fill = {
    color: selected ? selectedColor : unselectedColor(model.percent),
    opacity: selected ? selectedOpacityFill : unselectedOpacityFill(model.percent)
  }
  model.stroke = {
    color: selected ? selectedColor : unselectedColor(model.percent),
    opacity: selected ? selectedOpacityStroke : unselectedOpacityStroke(model.percent),
    weight: 1
  }
  return model
}

module.exports = {
  defaultBounds: defaultBounds,
  defaultCenter: defaultCenter,
  defaultZoom: defaultZoom,
  selectedColor: selectedColor,
  selectedOpacityFill: selectedOpacityFill,
  selectedOpacityStroke: selectedOpacityStroke,
  unselectedColor: unselectedColor,
  unselectedOpacityFill: unselectedOpacityFill,
  unselectedOpacityStroke: unselectedOpacityStroke,
  mapCellToMapModel: mapCellToMapModel,
  updateModelStyle: updateModelStyle
}
