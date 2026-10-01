const app = require('../app')

app
  .constant('GMAP_KEY', 'AIzaSyA9uIfcc1I4bNvfIS3vpGXxMxqZkjEukhY')
  .config(/* @ngInject */function (uiGmapGoogleMapApiProvider, GMAP_KEY) {
    uiGmapGoogleMapApiProvider.configure({
      key: GMAP_KEY
    })
  })
