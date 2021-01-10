// eslint-disable-next-line no-unused-vars
/* global self, caches, fetch, importScripts, workbox, Response */
/* eslint-disable indent */

import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { cacheNames, clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { initialize as googleAnalyticsInitialize } from 'workbox-google-analytics'
import {
    cleanupOutdatedCaches,
    createHandlerBoundToURL,
    matchPrecache,
    precache
} from 'workbox-precaching'
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing'
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies'

// network timeout for network first strategies - if not response in this time, serve from cache
const NETWORK_TIMEOUT_SECONDS = 0.5
// default html document to serve
const SINGLE_PAGE_URL = '/index.html'

precache([
    SINGLE_PAGE_URL,
    '/js/scripts.js',
    '/css/main.css'
], {
    ignoreURLParametersMatching: true
})

cleanupOutdatedCaches()

const handler = createHandlerBoundToURL(SINGLE_PAGE_URL)
const navigationRoute = new NavigationRoute(handler, {
    denylist: [/\/api\//]
})
registerRoute(navigationRoute)

// Catch routing errors, like if the user is offline
setCatchHandler(async ({ event }) => {
    // Return the precached offline page if a document is being requested
    if (event.request.destination === 'document') {
        return matchPrecache(SINGLE_PAGE_URL)
    }

    return Response.error()
})

// the primary resources that are precached
registerRoute(
    /\/(js\/scripts\.js|css\/main\.css)$/,
    new NetworkFirst({
        cacheName: cacheNames.precache,
        networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS
    })
)

// nomenclature data
registerRoute(
    /^.*\/api\/(staging\/)?(i18n|locations|nomenclature|organization|species|user|zone|visit)/,
    new StaleWhileRevalidate({
        cacheName: 'api-cache'
    })
)

// every other api request
registerRoute(
    /^.*\/api\//,
    new NetworkOnly()
)

registerRoute(
    /\.json$/,
    new NetworkFirst({
        cacheName: 'stats-cache',
        networkTimeoutSeconds: NETWORK_TIMEOUT_SECONDS
    })
)

registerRoute(
    // Cache HTML views files.
    /\/views\/.*\.html$/,
    // Use cache but update in the background.
    new StaleWhileRevalidate({
        // Use a custom cache name.
        cacheName: 'view-cache'
    })
)

registerRoute(
    // Cache image files.
    /\/img\/.*\.(?:png|jpg|jpeg|svg|gif)$/,
    // Use the cache if it's available.
    new CacheFirst({
        // Use a custom cache name.
        cacheName: 'image-cache',
        plugins: [
            new ExpirationPlugin({
                // Cache only 20 images.
                maxEntries: 20,
                // Cache for a maximum of a week.
                maxAgeSeconds: 7 * 24 * 60 * 60,
                // Purge this cache if storage quota has exceeded
                purgeOnQuotaError: true
            })
        ]
    })
)

registerRoute(
    // Cache CSS files.
    /\.css$/,
    // Use cache but update in the background.
    new StaleWhileRevalidate({
        // Use a custom cache name.
        cacheName: 'css-cache'
    })
)

registerRoute(
    // Cache fonts.
    /\/fonts\//,
    // Use cache but update in the background.
    new StaleWhileRevalidate({
        // Use a custom cache name.
        cacheName: 'font-cache',
        plugins: [
            new ExpirationPlugin({
                // Cache for a maximum of a year.
                maxAgeSeconds: 365 * 24 * 60 * 60
            })
        ]
    })
)

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
    /^https:\/\/fonts\.googleapis\.com/,
    new StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets'
    })
)

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
    /^https:\/\/fonts\.gstatic\.com/,
    new CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30,
                purgeOnQuotaError: true
            })
        ]
    })
)

googleAnalyticsInitialize()

registerRoute(
    /^https:\/\/maps\.googleapis\.com/,
    new StaleWhileRevalidate({
        cacheName: 'gmaps-cache'
    })
)

registerRoute(
    /^https:\/\/maps\.gstatic\.com/,
    new CacheFirst({
        cacheName: 'gmaps-static-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30,
                purgeOnQuotaError: true
            })
        ]
    })
)

self.skipWaiting()
clientsClaim()
