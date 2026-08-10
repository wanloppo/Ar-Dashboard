import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { deleteCookie, getCookie, setCookie } from 'h3'

const cookieName = 'ar_session'
const lifetimeSeconds = 8 * 60 * 60

export interface SessionUser {
  id: string
  name: string | null
  email: string | null
  role: string
}

interface SessionPayload extends SessionUser { exp: number }

function secret() {
  const value = String(useRuntimeConfig().authSecret)
  if (process.env.NODE_ENV === 'production' && value === 'replace-this-secret-in-production') {
    throw new Error('NUXT_AUTH_SECRET must be configured in production')
  }
  return value
}

function signature(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function setUserSession(event: H3Event, user: SessionUser) {
  const payload: SessionPayload = { ...user, exp: Math.floor(Date.now() / 1000) + lifetimeSeconds }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  setCookie(event, cookieName, `${encoded}.${signature(encoded)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: String(process.env.SESSION_COOKIE_SECURE || 'false').toLowerCase() === 'true',
    path: '/',
    maxAge: lifetimeSeconds
  })
}

export function clearUserSession(event: H3Event) {
  deleteCookie(event, cookieName, { path: '/' })
}

export function getUserSession(event: H3Event): SessionUser | null {
  const token = getCookie(event, cookieName)
  if (!token) return null
  const [encoded, provided] = token.split('.')
  if (!encoded || !provided) return null
  const expected = signature(encoded)
  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(provided)
  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) return null
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload
    if (!payload.id || payload.exp <= Math.floor(Date.now() / 1000)) return null
    return { id: String(payload.id), name: payload.name || null, email: payload.email || null, role: payload.role || 'user' }
  } catch {
    return null
  }
}
