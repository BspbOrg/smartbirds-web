const angular = require('angular')

// Leaflet path options, the same colours the Google version used.
const ZONE_STYLE = { color: '#c33', opacity: 0.7, weight: 0.5, fillColor: '#c33', fillOpacity: 0.4 }
const TRACK_STYLE = { color: '#36c', weight: 3 }

require('../app').directive('listMap', /* @ngInject */function ($filter, $http, db, Track) {
  return {
    templateUrl: '/views/directives/listmap.html',
    scope: {
      rows: '=?',
      ctrl: '=?',
      opts: '<?',
      markerWindowTemplate: '@?'
    },
    bindToController: true,
    controller: /* @ngInject */function ($scope, $state) {
      let $ctrl = this

      $ctrl.$onInit = function () {
        angular.extend($ctrl, {
          config: angular.extend({}, {
            haveZones: true,
            haveTracks: true,
            haveDetail: true
          }, $ctrl.opts || {}),
          zoneStyle: ZONE_STYLE,
          trackStyle: TRACK_STYLE,
          zones: [],
          zonesIndex: {},
          tracksWaiting: 0,
          tracks: [],
          tracksIndex: {},
          // selected.pin is the marker whose popup is open. A second click on it
          // opens the record.
          selected: {},
          marker: {
            control: {},
            click: function (marker, eventName, model) {
              if ($ctrl.selected && $ctrl.selected.pin === model) {
                if ($ctrl.config.haveDetail) {
                  $ctrl.openDetails()
                } else {
                  $ctrl.selected = undefined
                }
              } else {
                $ctrl.selected = { pin: model }
              }
            },
            // Popups also close from their × button, a map click or another
            // marker opening. Without this the next click on the marker would
            // skip the popup and open the record.
            popupClose: function (marker, eventName, model) {
              if ($ctrl && $ctrl.selected && $ctrl.selected.pin === model) {
                $ctrl.selected = {}
              }
            }
          },
          addRows: function (rows) {
            $ctrl.rows = [].concat($ctrl.rows || [], rows || [])
            $ctrl.refresh()
          },
          // zones and tracks get a new array rather than a push, so the map's
          // one-way bindings see the change.
          extractZones: function (rows) {
            const added = []
            const source = rows || $ctrl.rows
            source.forEach(function (row) {
              if (!row.zone || !db.zones[row.zone]) return
              // != null, not falsy: the first zone's index is 0
              if ($ctrl.zonesIndex[row.zone] != null) return
              $ctrl.zonesIndex[row.zone] = $ctrl.zones.length + added.length
              added.push(db.zones[row.zone])
            })
            if (added.length) $ctrl.zones = $ctrl.zones.concat(added)
          },
          extractTracks: function (rows) {
            (rows || $ctrl.rows).forEach(function (row) {
              if ($ctrl.tracksWaiting >= 3) return
              if (!row.track) return
              // != null, not falsy: the first track's index is 0
              if ($ctrl.tracksIndex[row.track] != null) return
              $ctrl.tracksIndex[row.track] = true
              $ctrl.tracksWaiting++
              Track.get(row.track).then(function (points) {
                if (!points.length) return
                $ctrl.tracksIndex[row.track] = $ctrl.tracks.length
                $ctrl.tracks = $ctrl.tracks.concat([{
                  id: $ctrl.tracks.length,
                  path: points
                }])
              })
                .finally(function () {
                  $ctrl.tracksWaiting--
                })
            })
            $ctrl.showTracks = $ctrl.tracksWaiting <= 1
          },
          refresh: function (rows) {
            if ($ctrl.config.haveZones) {
              $ctrl.extractZones(rows)
            }
            if ($ctrl.config.haveTracks) {
              $ctrl.extractTracks(rows)
            }
            if (angular.isFunction($ctrl.marker.control.newModels)) {
              $ctrl.marker.control.newModels($ctrl.rows)
            }
          },
          clear: function () {
            $ctrl.zones = []
            $ctrl.zonesIndex = {}
            $ctrl.rows = {}
            $ctrl.selected = {}
            $ctrl.tracks = []
            $ctrl.tracksIndex = {}
            $ctrl.tracksWaiting = 0
          },
          openDetails: function () {
            $state.go('.detail', { id: $ctrl.selected.pin.id })
          }
        })

        // expose ctrl interface
        if (angular.isObject($ctrl.ctrl)) {
          $ctrl.ctrl.clear = function () {
            if ($ctrl) $ctrl.clear.apply(this, arguments)
          }
          $ctrl.ctrl.refresh = function () {
            if ($ctrl) $ctrl.refresh.apply(this, arguments)
          }
          // prevent memory leaks
          $scope.$on('$destroy', function () {
            delete $ctrl.ctrl.clear
            delete $ctrl.ctrl.refresh
            delete $ctrl.zones
            $ctrl = null
          })
        }
      }
    },
    controllerAs: '$ctrl'
  }
})
