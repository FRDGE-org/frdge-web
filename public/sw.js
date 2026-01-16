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
// Handle when user clicks notification
self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        const url = event.notification.data.url || '/'
        
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url === url && 'focus' in client) {
            return client.focus()  // Focus existing tab
          }
        }
        
        // If not open, open new window
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})