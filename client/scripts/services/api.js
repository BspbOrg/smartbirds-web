/**
 * Created by groupsky on 10.11.15.
 */

const angular = require('angular')
require('../app').service('api', /* @ngInject */function ($log, $http, $resource, $q, $window, ENDPOINT_URL, User) {
  const api = this

  api.session = {
    login: function (auth) {
      const data = {}
      Object.assign(data, {
        include: ['bgatlasCells']
      }, auth)
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/session',
        data,
        withCredentials: true,
        skipSessionExpiredInterceptor: true
      })
    },
    restore: function (xsrf, opts, data) {
      data = Object.assign({},
        {
          include: ['bgatlasCells']
        }, data, {
          csrfToken: xsrf
        })
      return $http(angular.extend({
        method: 'PUT',
        url: ENDPOINT_URL + '/session',
        data,
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
          oldPassword,
          newPassword
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
          form,
          id,
          limit,
          force
        }
      })
    },
    bgatlas2008: function (form, id, limit, force) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/tasks/bgatlas2008',
        data: {
          form,
          id,
          limit,
          force
        }
      })
    },
    autoVisit: function (form, id, limit, force) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/tasks/auto-visit',
        data: {
          form,
          id,
          limit,
          force
        }
      })
    },
    birdsNewSpeciesModeratorReview: function (form, id, limit, force) {
      return $http({
        method: 'POST',
        url: ENDPOINT_URL + '/tasks/birds-new-species-moderator-review',
        data: {
          form,
          id,
          limit,
          force
        }
      })
    }
  }

  api.stats = {}

  const forms = [
    'campaign',
    'birds',
    'birds_top',
    'cbm',
    'ciconia',
    'fishes',
    'fishes_top',
    'herptiles',
    'herptiles_top',
    'invertebrates',
    'invertebrates_top',
    'mammals',
    'mammals_top',
    'plants',
    'plants_top',
    'threats',
    'total_user_records',
    'user_rank',
    'birds_migrations_peak_daily_species',
    'birds_migrations_season_totals',
    'birds_migrations_top_interesting_species_month'
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
      params,
      withCredentials: true
    }).then(function (response) {
      return response.data
    })
  }

  api.bgatlas2008 = {
    userGrid: function () {
      return $http({
        method: 'GET',
        url: ENDPOINT_URL + '/bgatlas/2008/',
        withCredentials: true
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
          cells
        }
      }).then(function (response) {
        return response.data
      })
    },

    getCellInfo: function (utmCode) {
      const canceler = $q.defer()
      const promise = $http({
        method: 'GET',
        url: ENDPOINT_URL + '/bgatlas/cell/' + utmCode,
        withCredentials: true,
        timeout: canceler.promise
      }).then(function (response) {
        return response.data
      })
      promise.cancel = canceler.resolve
      return promise
    },

    getCellStats: function (utmCode) {
      const canceler = $q.defer()
      const promise = $http({
        method: 'GET',
        url: ENDPOINT_URL + '/bgatlas/cell/' + utmCode + '/stats',
        withCredentials: true,
        timeout: canceler.promise
      }).then(function (response) {
        return response.data
      })
      promise.cancel = canceler.resolve
      return promise
    },

    globalCellStats: function () {
      return $http({
        method: 'GET',
        url: (process.env.STATS_PREFIX || '') + '/bgatlas2008_global_stats.json'
      }).then(function (response) {
        return response.data
      })
    },

    observerRanking: function () {
      const canceler = $q.defer()
      const promise = $http({
        method: 'GET',
        url: ENDPOINT_URL + '/bgatlas/stats/user_rank',
        withCredentials: true,
        timeout: canceler.promise
      }).then(function (response) {
        return response.data
      })
      promise.cancel = canceler.resolve
      return promise
    },

    moderatorCellMethodology: function (utmCode) {
      const canceler = $q.defer()
      const promise = $http({
        method: 'GET',
        url: ENDPOINT_URL + '/bgatlas/moderator/' + utmCode + '/methodology',
        withCredentials: true,
        timeout: canceler.promise
      }).then(function (response) {
        return response.data
      })
      promise.cancel = canceler.resolve
      return promise
    },

    moderatorCellUsers: function (utmCode) {
      const canceler = $q.defer()
      const promise = $http({
        method: 'GET',
        url: ENDPOINT_URL + '/bgatlas/moderator/' + utmCode + '/user',
        withCredentials: true,
        timeout: canceler.promise
      }).then(function (response) {
        return response.data
      })
      promise.cancel = canceler.resolve
      return promise
    },

    cellStatus: function (utmCode) {
      const canceler = $q.defer()
      const promise = $http({
        method: 'GET',
        url: ENDPOINT_URL + '/bgatlas/cell/' + utmCode + '/status',
        withCredentials: true,
        timeout: canceler.promise
      }).then(function (response) {
        return response.data
      })
      promise.cancel = canceler.resolve
      return promise
    },

    setCellStatus: function (utmCode, update) {
      const canceler = $q.defer()
      const promise = $http({
        method: 'PATCH',
        url: ENDPOINT_URL + '/bgatlas/cell/' + utmCode + '/status',
        withCredentials: true,
        timeout: canceler.promise,
        data: update
      }).then(function (response) {
        return response.data
      })
      promise.cancel = canceler.resolve
      return promise
    }
  }

  api.reports = {
    daily: (date) => $http({
      method: 'GET',
      url: ENDPOINT_URL + `/reports/daily/${date instanceof Date ? date.getTime() : date}`,
      withCredentials: true
    }).then(function (response) {
      return response.data
    })
  }
})
