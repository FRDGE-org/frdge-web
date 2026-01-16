import { NextResponse } from 'next/server'
import { sendPushNotification } from '@/actions/notifications'
import { getUser } from '@/auth/server'

export async function GET() {
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const result = await sendPushNotification(user.id, {
    title: '🍅 Test Notification!',
    body: 'Your tomato expires tomorrow. Use it in a recipe!',
    url: '/',
    icon: '/frdge-logo.png'
  })

  return NextResponse.json(result)
}
