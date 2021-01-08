require('../app')
  .config(/* @ngInject */function ($compileProvider) {
    // enable data hrefs for client side generated download files
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/)
  })
