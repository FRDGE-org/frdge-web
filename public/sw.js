// Service worker version - increment this to force update
const CACHE_VERSION = 'v5'

// Force immediate activation of new service worker
self.addEventListener('install', function(event) {
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim())
})

// This runs in the background, separate from the React app
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json()
        const options = {
            body: data.body,
            icon: data.icon || '/frdge-logo.png',
            badge: '/frdge-logo.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                url: data.url || '/'
            }
        }
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        )
    }
})

// Handle when user clicks notification
self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        const urlToOpen = event.notification.data.url || '/'
        const appOrigin = self.location.origin  // e.g. https://frdge.app

        // Find a tab that's on our app (same origin)
        const appTab = clientList.find(function(client) {
          return !client.url.endsWith('test-notification') && client.url.startsWith(appOrigin)
        })

        if (appTab) {
          // Focus the existing app tab and navigate to notification URL
          return appTab.focus().then(function() {
            if ('navigate' in appTab) {
              return appTab.navigate(urlToOpen)
            }
          })
        }

        // No app tab open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})