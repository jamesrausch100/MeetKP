import { randomBytes, createHash } from 'crypto'
import { prisma } from './db'

/**
 * Generate a new API key with a readable prefix.
 * Returns { raw, hashed, prefix } — only return `raw` to the user ONCE.
 */
export function generateApiKey(): { raw: string; hashed: string; prefix: string } {
  const raw = `mkp_${randomBytes(32).toString('hex')}`
  const prefix = raw.slice(0, 12)
  const hashed = hashKey(raw)
  return { raw, hashed, prefix }
}

/** Hash an API key for storage (SHA-256). */
export function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Authenticate a request via API key in the Authorization header.
 * Returns the userId if valid, or null.
 */
export async function authenticateApiKey(
  request: Request
): Promise<{ userId: string; keyId: string } | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const raw = authHeader.slice(7).trim()
  if (!raw.startsWith('mkp_')) return null

  const hashed = hashKey(raw)

  const apiKey = await prisma.apiKey.findUnique({
    where: { key: hashed },
  })

  if (!apiKey || apiKey.revoked) return null
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null

  // Update last used (fire and forget)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  }).catch(() => {})

  return { userId: apiKey.userId, keyId: apiKey.id }
}
