import { prisma } from '@/db/prisma'
import { sendPushNotification } from '@/actions/notifications'


export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    process.env.NODE_ENV === 'development'
  )
    return new Response('Unauthorized', { status: 401 })

  // Query ingredients expiring within 2 days using raw SQL
  const expiringSoon = await prisma.$queryRaw<{
    id: string;
    name: string;
    authorId: string
  }[]>`
  SELECT id, name, "authorId"
  FROM "Ingredient"
  WHERE (
    "dateBought" +
    CASE "timeToExpire"
      WHEN 'VERYSHORT' THEN INTERVAL '7 days'
      WHEN 'SHORT'     THEN INTERVAL '14 days'
      WHEN 'MEDIUM'    THEN INTERVAL '30 days'
      WHEN 'LONG'      THEN INTERVAL '180 days'
      WHEN 'VERYLONG'  THEN INTERVAL '730 days'
    END
  ) BETWEEN NOW() AND NOW() + INTERVAL '2 days'
  `

  // Group by user
  const byUser = new Map<string, string[]>()
  for (const ingredient of expiringSoon) {
    const userId = ingredient.authorId
    if (!byUser.has(userId))
      byUser.set(userId, [])
    byUser.get(userId)!.push(ingredient.name)
  }

  // Send notifications
  const results = []
  for (const [userId, names] of byUser) {
    const body = names.length <= 2
      ? `${names.join(' and ')} expire in the next 2 days`
      : `${names.slice(0, 2).join(', ')}, and ${names.length - 2} more expire in the next 2 days`

    const result = await sendPushNotification(userId, {
      title: 'Food expiring soon',
      body,
      url: '/'
    })

    results.push({ userId, result })
  }

  return Response.json({
    expiring: expiringSoon.length,
    usersNotified: byUser.size,
    results
  })
}