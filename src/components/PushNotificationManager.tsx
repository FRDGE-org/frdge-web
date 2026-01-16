'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/actions/notifications'

// Converts base64 VAPID key to Uint8Array (required by browser API)
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationManager({ userId }: { userId: string }) {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if browser supports push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      // Check if already subscribed
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.log('Service worker registration failed:', error)

      // Set user-friendly serror message
      if (error instanceof TypeError) {
        setError('Could not load notification service. Please refresh the page.')
      } else {
        setError('Notifications are temporarily unavailable.')
      }
    }
  }

  async function subscribe() {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready

      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Notification permission denied')
        return
      }

      // Subscribe to push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,  // Required: all notifications must be shown
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        )
      })
      
      // Save subscription to database
      const result = await subscribeToPushNotifications(userId, sub.toJSON())

      if (result.success) {
        setSubscription(sub)
      }
    } catch (error) {
      console.error('Failed to subscribe:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribe() {
    setIsLoading(true)
    try {
      await subscription?.unsubscribe()
      await unsubscribeFromPushNotifications(userId)
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return <p>Push notifications not supported on this browser</p>
  }

  if (error) {
    return (
      <div>
        <p className='text-red-500'>{error}</p>
        <button onClick={registerServiceWorker}>Retry</button>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-2'>
      {subscription
        ?
        (<Button onClick={unsubscribe} disabled={isLoading}>
          Disable notifications
        </Button>)
        :
        (<Button onClick={subscribe} disabled={isLoading}>
          Enable notifications
        </Button>)
      }
    </div>
  )
}