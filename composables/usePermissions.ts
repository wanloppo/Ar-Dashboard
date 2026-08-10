import type { ScreenAction, ScreenPermission } from '~/types/screen'

export function usePermissions() {
  const permissions = useState<ScreenPermission[]>('screen-permissions', () => [])
  const loaded = useState<boolean>('screen-permissions-loaded', () => false)
  const { data: sessionData } = useAuth()
  const isAdmin = computed(() => ((sessionData.value?.user || {}) as { role?: string }).role === 'admin')

  async function loadPermissions(force = false, headers?: Record<string, string>) {
    if (loaded.value && !force) return
    try {
      const result = await $fetch<{ role: string; screens: ScreenPermission[] }>('/api/auth/permissions', { headers })
      permissions.value = result.screens
    } catch {
      permissions.value = []
    } finally {
      loaded.value = true
    }
  }

  function can(screen: string, action: ScreenAction) {
    if (isAdmin.value) return true
    const found = permissions.value.find(item => item.screen_eng_name === screen)
    return !found || Boolean(found[`${action}_active`])
  }

  return { permissions, loaded, isAdmin, loadPermissions, can }
}
