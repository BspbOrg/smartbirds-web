const angular = require('angular')

require('../app').service('modelResource', /* @ngInject */function ($q, Raven, Nomenclature, $translate) {
  const service = this

  service.genSingleObservationCode = function (data) {
    let date = data.observationDateTime || data.startDateTime
    if (date && date.toJSON) { date = date.toJSON() }
    return '!SINGLE-' + date
  }

  service.clearGeneratedSingleObservationCode = function (data) {
    if (data.monitoringCode === service.genSingleObservationCode(data)) {
      data.monitoringCode = null
    }
    return data
  }

  service.save = function (Resource, data) {
    let localId
    if (data.$local) {
      localId = data.id
      delete data.id
    }
    delete data.$local

    const resource = new Resource(data)
    if (!resource.monitoringCode) {
      resource.monitoringCode = service.genSingleObservationCode(data)
    }
    if (!resource.observationDateTime) {
      resource.observationDateTime = resource.startDateTime
    }
    if (angular.isFunction(resource.preSave)) resource.preSave()
    return resource
      .$save()
      .then(function (res) {
        if (localId) {
          Resource.localDelete(localId)
          localId = null
        }
        return res
      }, function (error) {
        if (resource.id == null && error && error.status === -1) {
          resource.$local = true
          if (localId) {
            resource.id = localId
          }
          return resource.$localSave()
        }
        return $q.reject(error)
      })
      .then(function (res) {
        service.clearGeneratedSingleObservationCode(res)
        return res
      })
      .catch(function (error) {
        if (error) {
          switch (error.status) {
            case 401: // not authenticated
              return $q.reject(error)
          }
        }
        Raven.captureException(error, {
          extra: {
            error: JSON.stringify(error)
          }
        })
        return $q.reject(error)
      })
  }
})
