// Service worker version - increment this to force update
const CACHE_VERSION = 'v3'

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

        // If any tab is open, focus it and navigate if needed
        if (clientList.length > 0) {
          const client = clientList[0]
          return client.focus().then(function() {
            if ('navigate' in client) {
              return client.navigate(urlToOpen)
            }
          })
        }

        // If no tabs open, open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})