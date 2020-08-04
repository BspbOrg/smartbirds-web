/**
 * Created by groupsky on 10.11.15.
 */

var angular = require('angular')
require('../app').service('api', /* @ngInject */function ($log, $http, $resource, $q, $window, ENDPOINT_URL, User) {
  var api = this

  api.session = {
    login: function (auth) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/session',
        data: auth,
        withCredentials: true,
        skipSessionExpiredInterceptor: true
      })
    },
    restore: function (xsrf, opts) {
      return $http(angular.extend({
        method: 'PUT',
        url: ENDPOINT_URL + '/session',
        data: {
          csrfToken: xsrf
        },
        withCredentials: true
      }, opts))
    },
    forgotPassword: function (auth) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/session/' + auth.email + '/resetpw',
        data: auth
      })
    },
    resetPassword: function (auth) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/session/' + auth.email + '/resetpw2',
        data: auth
      })
    },
    logout: function () {
      return $http({
        method: 'DELETE',
        url: ENDPOINT_URL + '/session'
      })
    },
    changePassword: function (userId, oldPassword, newPassword) {
      return $http({
        method: 'PATCH',
        url: ENDPOINT_URL + '/user/' + $window.encodeURIComponent(userId),
        data: {
          oldPassword: oldPassword,
          newPassword: newPassword
        }
      })
    }
  }

  api.tasks = {
    autoLocation: function (form, id, limit, force) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/tasks/auto-location',
        data: {
          form: form,
          id: id,
          limit: limit,
          force: force
        }
      })
    },
    bgatlas2008: function (form, id, limit, force) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/tasks/bgatlas2008',
        data: {
          form: form,
          id: id,
          limit: limit,
          force: force
        }
      })
    }
  }

  api.stats = {}

  var forms = [
    'campaign',
    'birds',
    'cbm',
    'ciconia',
    'herptiles',
    'mammals',
    'invertebrates',
    'plants',
    'birds_top',
    'herptiles_top',
    'plants_top',
    'mammals_top',
    'invertebrates_top',
    'total_user_records',
    'user_rank',
    'threats'
  ]
  forms.forEach(function (form) {
    api.stats[form + '_stats'] = function () {
      return $http({
        method: 'GET',
        url: (process.env.STATS_PREFIX || '') + '/' + form + '_stats.json'
      }).then(function (response) {
        return response.data
      })
    }
  })

  api.organizations = function () {
    return $http({
      method: 'GET',
      url: (process.env.STATS_PREFIX || '') + '/organizations.json'
    }).then(function (response) {
      return response.data
    })
  }

  /**
   * @param {{q: string, type: string}}params
   * @returns {Promise<{string[]>}
   */
  api.autocomplete = function (params) {
    return $http({
      method: 'GET',
      url: ENDPOINT_URL + '/autocomplete',
      params: params,
      withCredentials: true
    }).then(function (response) {
      return response.data
    })
  }

  api.bgatlas2008 = {
    userGrid: function () {
      return $http({
        method: 'GET',
        url: ENDPOINT_URL + '/bgatlas/2008/'
      }).then(function (response) {
        return response.data
      })
    },

    /**
     * Set user selected cells
     * @param {string[]} cells - list of utm codes for selected cells
     */
    setSelected: function (cells) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/bgatlas/user/selected',
        data: {
          cells: cells
        }
      }).then(function (response) {
        return response.data
      })
    }
  }
})
