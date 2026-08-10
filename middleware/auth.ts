const screenByPath: Array<{ prefix: string; screen: string }> = [
  { prefix: '/daily', screen: 'creditinvoice_daily' }
]
const adminOnlyPaths = ['/screens', '/access']

export default defineNuxtRouteMiddleware(async (to) => {
  const { status, data, getSession } = useAuth()
  if (status.value === 'loading') {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    await getSession(headers)
  }
  if (status.value === 'unauthenticated') return navigateTo('/login')
  const role = ((data.value?.user || {}) as { role?: string }).role || 'user'
  if (adminOnlyPaths.some(path => to.path.startsWith(path))) {
    if (role !== 'admin') return navigateTo('/')
    return
  }
  const screen = to.path === '/' ? 'creditinvoice_dashboard' : screenByPath.find(item => to.path.startsWith(item.prefix))?.screen
  if (!screen || role === 'admin') return
  const { can, loadPermissions } = usePermissions()
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  await loadPermissions(false, headers)
  if (!can(screen, 'query') && to.path !== '/') return navigateTo('/')
})
