require('../app').factory('EBPSpeciesStatus', /* @ngInject */function ($resource, ENDPOINT_URL, localization) {
  const EBPSpeciesStatus = $resource(ENDPOINT_URL + '/ebp-species-status', {}, {
    update: { method: 'PUT', isArray: true }
  })
  return EBPSpeciesStatus
})
