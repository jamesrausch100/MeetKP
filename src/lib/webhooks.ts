import { prisma } from './db'

export type WebhookEvent =
  | 'partnership.proposed'
  | 'partnership.accepted'
  | 'partnership.declined'
  | 'partnership.dissolved'
  | 'handshake.initiated'

/**
 * Fire a webhook to an agent's registered webhook URL.
 * Retries up to 3 times with exponential backoff.
 * Logs every attempt to WebhookLog.
 */
export async function fireWebhook(
  userId: string,
  webhookUrl: string,
  event: WebhookEvent,
  payload: Record<string, any>
): Promise<boolean> {
  if (!webhookUrl) return false

  const body = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload })
  let status = 0
  let responseBody = ''
  let success = false
  let attempts = 0

  const delays = [0, 2000, 4000]

  for (const delay of delays) {
    if (delay > 0) await sleep(delay)
    attempts++

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MeetKP-Event': event,
          'User-Agent': 'MeetKP-Webhooks/1.0',
        },
        body,
        signal: controller.signal,
      })

      clearTimeout(timeout)
      status = res.status
      responseBody = (await res.text()).slice(0, 500)
      success = res.ok
      if (success) break
    } catch (err: any) {
      status = 0
      responseBody = err.message?.slice(0, 500) || 'Network error'
    }
  }

  // Log the attempt
  await prisma.webhookLog.create({
    data: {
      userId,
      event,
      payload: body,
      url: webhookUrl,
      status,
      response: responseBody,
      attempts,
      success,
    },
  }).catch(() => {})

  return success
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
