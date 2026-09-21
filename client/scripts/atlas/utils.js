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
    percent,
    coordinates: cell.coordinates,
    cell,
    completed: !!cell.completed
  }
  updateModelStyle(model, selected)
  return model
}

function updateModelStyle (model, selected) {
  model.fill = model.fill || {}
  model.stroke = model.stroke || {}
  model.stroke.weight = 1
  if (selected) {
    model.fill.color = selectedColor
    model.fill.opacity = selectedOpacityFill
    model.stroke.color = selectedColor
    model.stroke.opacity = selectedOpacityStroke
  } else {
    model.fill.opacity = unselectedOpacityFill()
    model.stroke.opacity = unselectedOpacityStroke(model.percent)

    if (model.completed) {
      model.fill.color = completedColor
      model.stroke.color = completedColor
    } else {
      model.fill.color = unselectedColor(model.percent)
      model.stroke.color = unselectedColor(model.percent)
    }
  }
  return model
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
  updateModelStyle,
  colors: { low: lowColor, med: medColor, high: highColor, completed: completedColor }
}
