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

function mapCellToMapModel (cell) {
  const percent = cell.spec_old > 0 ? 100.0 * cell.spec_known / cell.spec_old : 0
  const model = {
    id: cell.utm_code,
    percent,
    coordinates: cell.coordinates,
    cell,
    completed: !!cell.completed
  }
  // The unselected look, for maps that do not pass a polygon-style-fn
  return Object.assign(model, cellStyle(model, false))
}

// The {fill, stroke} to draw a cell with. Returns a new object every time.
function cellStyle (model, selected) {
  if (selected) {
    return {
      fill: { color: selectedColor, opacity: selectedOpacityFill },
      stroke: { color: selectedColor, opacity: selectedOpacityStroke, weight: 1 }
    }
  }
  const color = model.completed ? completedColor : unselectedColor(model.percent)
  return {
    fill: { color, opacity: unselectedOpacityFill() },
    stroke: { color, opacity: unselectedOpacityStroke(model.percent), weight: 1 }
  }
}

module.exports = {
  defaultZoom,
  selectedColor,
  selectedOpacityFill,
  selectedOpacityStroke,
  unselectedColor,
  unselectedOpacityFill,
  unselectedOpacityStroke,
  mapCellToMapModel,
  cellStyle,
  colors: { low: lowColor, med: medColor, high: highColor, completed: completedColor }
}
