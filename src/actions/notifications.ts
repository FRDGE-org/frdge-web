'use server'

import webpush from 'web-push'
import { prisma } from '@/db/prisma'

const missingVapidDetails = []
if (!process.env.VAPID_EMAIL) missingVapidDetails.push('VAPID_EMAIL')
if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) missingVapidDetails.push('NEXT_PUBLIC_VAPID_PUBLIC_KEY')
if (!process.env.VAPID_PRIVATE_KEY) missingVapidDetails.push('VAPID_PRIVATE_KEY')

if (missingVapidDetails.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVapidDetails.join(', ')}\n` +
    'Run: pnpm dlx web-push generate-vapid-keys\n' +
    'Then add the keys to your .env file'
  )
}

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeToPushNotifications(
  userId: string,
  subscription: PushSubscriptionJSON
) {
  try {
    // Store subscription in db
    await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint!,
        p256dh: subscription.keys!.p256dh,
        auth: subscription.keys!.auth
      }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to subscribe to push notification' }
  }
}

export async function unsubscribeFromPushNotifications(userId: string) {
  try {
    await prisma.pushSubscription.deleteMany({
      where: { userId }
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: 'failed to unsubscribe' }
  }
}

export async function sendPushNotification(
  userId: string,
  notification: { title: string; body: string; url?: string }
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    })

    if (subscriptions.length === 0) {
      return {
        success: false,
        error: 'No subscriptions found for user'
      }
    }

    // Send to all subscriptions, track failures
    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          JSON.stringify(notification)
        ).catch(async error => {
          // If subscription is invalid / expired, delete it
          if (error.statusCode === 410) {
            await prisma.pushSubscription.delete({
              where: { id: sub.id }
            })
          }
          throw error
        })
      )
    )

    const failures = results.filter(r => r.status === 'rejected')

    if (failures.length === results.length) {
      return {
        success: false,
        error: 'All notifications failed to send'
      }
    }

    if (failures.length > 0) {
      return {
        success: true,
        warning: `${failures.length}/${results.length} notifications failed`
      }
    }

    return { success: true }
  } catch (error) {
    console.log('Failed to send notification:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send push notification:'
    }
  }
}