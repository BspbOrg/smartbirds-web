var app = require('../app')

app.constant('ENDPOINT_URL', process.env.API_PREFIX || (
  (process.env.NODE_ENV || 'development') === 'development'
    ? 'http://' + window.location.hostname + ':5000/api'
    : '/api'
))

app.constant('BANNER_BASE_URL', window.location.protocol + '//' + window.location.hostname + (window.location.port && ':' + window.location.port) + '/banner/')
