const defaultBounds = {
  northeast: {
    latitude: 44.44350031073804,
    longitude: 29.21416050689999
  },
  southwest: {
    latitude: 40.91718468273068,
    longitude: 21.21611363189999
  }
}

const defaultCenter = {
  latitude: 42.70537387439325, longitude: 25.2151370694
}

const defaultZoom = 7

const selectedColor = '#33c'
const selectedOpacityFill = 0.65
const selectedOpacityStroke = 1

const highColor = '#4C9900'
const medColor = '#FCE949'
const lowColor = '#E41A1C'
const completedColor = '#333'

const unselectedColor = function (percent) {
  if (percent < 30) {
    return lowColor
  }
  if (percent < 65) {
    return medColor
  }
  return highColor
}
const unselectedOpacityFill = function () {
  return 0.35
}

const unselectedOpacityStroke = function (percent) {
  if (percent < 30) {
    return 0.4
  }
  if (percent < 65) {
    return 0.8
  }
  return 0.4
}

function mapCellToMapModel (cell, selected) {
  const percent = cell.spec_old > 0 ? 100.0 * cell.spec_known / cell.spec_old : 0
  const model = {
    id: cell.utm_code,
    percent: percent,
    coordinates: cell.coordinates,
    cell: cell,
    completed: !!cell.completed
  }
  updateModelStyle(model, selected)
  return model
}

function updateModelStyle (model, selected) {
  model.fill = {
    color: selected ? selectedColor : unselectedColor(model.percent),
    opacity: selected ? selectedOpacityFill : unselectedOpacityFill()
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
  updateModelStyle: updateModelStyle,
  colors: { low: lowColor, med: medColor, high: highColor, completed: completedColor }
}
