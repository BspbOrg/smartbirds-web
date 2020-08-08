var angular = require('angular')
var modulename = require('./modulename')
var states = require('./states')
var AtlasDashboardController = require('./controllers/AtlasDashboardController')
var AtlasRequestController = require('./controllers/AtlasRequestController')

module.exports = angular
  .module(modulename, [])
  .config(states)
  .controller('AtlasDashboardController', AtlasDashboardController)
  .controller('AtlasRequestController', AtlasRequestController)
