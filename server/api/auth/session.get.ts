import { getUserSession } from '../../utils/session'
export default defineEventHandler((event) => {
  const user = getUserSession(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'กรุณาเข้าสู่ระบบ' })
  return { user }
})
