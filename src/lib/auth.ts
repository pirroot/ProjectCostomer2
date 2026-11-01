import { cookies } from 'next/headers'
import crypto from 'crypto'

const COOKIE_NAME = 'pf_admin'

function adminToken(): string {
  const pw = process.env.ADMIN_PASSWORD || 'admin123'
  return crypto.createHmac('sha256', `portfolio:${pw}`).update('admin-session').digest('hex')
}

export function checkPassword(password: string): boolean {
  const pw = process.env.ADMIN_PASSWORD || 'admin123'
  return typeof password === 'string' && password.length > 0 && password === pw
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value === adminToken()
}

export async function setAdminSession(): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, adminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

/** Throws when called from a server action / route handler without a valid session. */
export async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error('UNAUTHORIZED')
  }
}
