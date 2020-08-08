var angular = require('angular')
var bulk = require('bulk-require')
var info = require('../../package.json')
var Workbox = require('workbox-window').Workbox

require('./services/crashReporting')

// used by angular-google-maps
global._ = require('lodash')
require('angular-simple-logger')
// required by angular-xml
global.X2JS = require('x2js')

// include angular dependencies
require('angular-google-maps')
require('ng-toast')
require('ng-infinite-scroll')
require('angular-file-upload')
require('ngstorage')
require('angular-translate')
require('angular-translate-loader-url')
require('angular-bootstrap-lightbox')

var dependencies = [
  require('angular-i18n/bg'),
  require('angular-cookies'),
  require('angular-resource'),
  require('angular-sanitize'),
  require('angular-animate'),

  require('angular-ui-router'),
  require('angular-ui-bootstrap'),
  require('ui-select'),

  require('angular-strap'),

  require('@lordfriend/nya-bootstrap-select'),

  'ngToast',

  'uiGmapgoogle-maps',

  'infinite-scroll',

  require('angular-loading-bar'),

  'ngRaven',

  require('angular-filter'),

  require('angulartics'),

  require('angulartics-google-analytics'),

  'angularFileUpload',

  'ngStorage',

  require('angular-xml'),

  'bootstrapLightbox',

  'pascalprecht.translate',

  require('./atlas')
]

// install service worker
if ('serviceWorker' in navigator) {
  var wb = new Workbox('/sw.js')
  wb.register()
  window.SW_STATUS = 'registered'
}

var app = module.exports = angular.module('sb', dependencies)

app.run(/* @ngInject */function ($rootScope) {
  $rootScope.$system = info
})

// semicolon is required because bulk is transformed into ({}) and that is evaluated as a function call to above statement
// noinspection JSUnnecessarySemicolon
; // eslint-disable-line semi
// include all js files
bulk(__dirname, ['./**/!(app|*.spec).js'])
