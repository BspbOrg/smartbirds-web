/**
 * Created by groupsky on 17.03.16.
 */

const angular = require('angular')
require('../app').service('db', /* @ngInject */function ($q, Location, Nomenclature, Poi, Species, User, Visit, Zone, user, Organization, MapLayer) {
  const db = {
    locations: {},
    nomenclatures: {},
    species: {},
    publicUsers: {},
    users: {},
    zones: {},
    visits: {},
    organizations: {},
    mapLayers: {}
  }

  db.locations.$promise = user.authPromise
    .then(function () {
      return Location.query({ limit: -1 }).$promise
    })
    .then(function (locations) {
      const res = db.locations
      locations.forEach(function (location) {
        res[location.id] = location
      })
      return res
    })
    .finally(function () {
      delete db.locations.$promise
    });

  (db.$updateNomenclatures = function () {
    db.nomenclatures = {}
    db.nomenclatures.$promise = user.authPromise
      .then(function () {
        return Promise.all([
          Nomenclature.query({ limit: -1 }).$promise,
          Poi.query({ limit: -1 }).$promise
        ])
      })
      .then(function (itemsList) {
        const res = db.nomenclatures
        itemsList.forEach(function (items) {
          items.forEach(function (item) {
            res[item.type] = res[item.type] || {}
            res[item.type][item.label.en] = item
          })
        })
        return res
      })
      .finally(function () {
        delete db.nomenclatures.$promise
      })
  })();

  (db.$updateSpecies = function () {
    db.species = {}
    db.species.$promise = user.authPromise
      .then(function () {
        return Species.query({ limit: -1 }).$promise
      })
      .then(function (items) {
        const res = db.species
        items.forEach(function (item) {
          res[item.type] = res[item.type] || {}
          res[item.type][item.label.la] = item
        })
        return res
      })
      .finally(function () {
        delete db.species.$promise
      })
  })()

  db.users.$promise = user.authPromise
    .then(function () {
      return User.query({ limit: -1 }).$promise
    })
    .then(function (users) {
      const res = db.users
      users.forEach(function (user) {
        res[user.id] = user
      })
      return res
    })
    .catch(function (response) {
      if (response.status === 403) {
        return []
      }
      return $q.reject(response)
    })
    .finally(function () {
      delete db.users.$promise
    })

  db.publicUsers.$promise = user.authPromise
    .then(function () {
      return User.query({ limit: -1, context: 'public' }).$promise
    })
    .then(function (publicUsers) {
      const res = db.publicUsers
      publicUsers.forEach(function (user) {
        res[user.id] = user
      })
      return res
    })
    .catch(function (response) {
      if (response.status === 403) {
        return []
      }
      return $q.reject(response)
    })
    .finally(function () {
      delete db.publicUsers.$promise
    })

  db.zones.$promise = user.authPromise
    .then(function () {
      return Zone.query({ limit: -1, nomenclature: true }).$promise
    })
    .then(function (zones) {
      const res = db.zones
      zones.forEach(function (zone) {
        res[zone.id] = zone
      })
      return res
    })
    .finally(function () {
      delete db.zones.$promise
    })

  db.visits.$promise = user.authPromise
    .then(function () {
      return Visit.query({ limit: -1, nomenclature: true }).$promise
    })
    .then(function (visits) {
      const res = db.visits
      visits.forEach(function (visit) {
        res[visit.year] = visit
      })
      return res
    }).finally(function () {
      delete db.visits.$promise
    });

  (db.$updateOrganizations = function () {
    db.organizations.$promise = user.authPromise
      .then(function () {
        return Organization.query({ limit: -1, nomenclature: true }).$promise
      })
      .then(function (organizations) {
        db.organizations = {}
        organizations.forEach(function (organization) {
          db.organizations[organization.slug] = organization
        })
        return db.organizations
      }).finally(function () {
        delete db.organizations.$promise
      })
  })();

  (db.$updateMapLayers = function () {
    db.mapLayers = {}
    db.mapLayers.$promise = user.authPromise
      .then(function () {
        return MapLayer.query({ limit: -1 }).$promise
      })
      .then(function (items) {
        const res = db.mapLayers
        items.forEach(function (item) {
          res[item.type] = res[item.type] || {}
          res[item.type][item.label.en] = item
        })
        return res
      })
      .finally(function () {
        delete db.mapLayers.$promise
      })
  })()

  const promises = []
  angular.forEach(db, function (table) {
    table.$promise && promises.push(table.$promise)
  })
  db.$promise = $q.all(promises).then(function () {
    return db
  }).finally(function () {
    delete db.$promise
  })

  return db
})
