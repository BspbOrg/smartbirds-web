require('../app').factory('EBPSpecies', /* @ngInject */function ($resource, ENDPOINT_URL, localization) {
  const EBPSpecies = $resource(ENDPOINT_URL + '/ebp-species', {}, {
    update: { method: 'PUT', isArray: true }
  })
  return EBPSpecies
})
