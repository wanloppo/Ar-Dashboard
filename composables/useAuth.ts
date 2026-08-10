interface AuthSession {
  user: { id: string; name: string | null; email: string | null; role: string }
}

export function useAuth() {
  const data = useState<AuthSession | null>('auth-session', () => null)
  const status = useState<'loading' | 'authenticated' | 'unauthenticated'>('auth-status', () => 'loading')

  async function getSession(headers?: Record<string, string>) {
    status.value = 'loading'
    try {
      data.value = await $fetch<AuthSession>('/api/auth/session', { headers })
      status.value = 'authenticated'
    } catch {
      data.value = null
      status.value = 'unauthenticated'
    }
    return data.value
  }

  async function signIn(_provider: string, options: { username: string; password: string; redirect?: boolean }) {
    try {
      data.value = await $fetch<AuthSession>('/api/auth/login', { method: 'POST', body: { username: options.username, password: options.password } })
      status.value = 'authenticated'
      return { error: null }
    } catch {
      data.value = null
      status.value = 'unauthenticated'
      return { error: 'CredentialsSignin' }
    }
  }

  async function signOut(options?: { callbackUrl?: string }) {
    try { await $fetch('/api/auth/logout', { method: 'POST' }) } finally {
      data.value = null
      status.value = 'unauthenticated'
      await navigateTo(options?.callbackUrl || '/login')
    }
  }

  return { data, status, getSession, signIn, signOut }
}
