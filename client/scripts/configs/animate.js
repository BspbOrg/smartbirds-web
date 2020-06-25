var app = require('../app')

app.config(function ($animateProvider) {
  // disable animation waiting on font awesome spinners,
  // otherwise the interface is switched to display the result,
  // but the spinner remains
  $animateProvider.classNameFilter(/^(?:(?!fa-spin).)*$/)
})
