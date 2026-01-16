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
        clients.openWindow(event.notification.data.url || '/')
    )
})