import { getDb } from '../../utils/db'
import { serverError } from '../../utils/http'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const admin = await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (!id || id === Number(admin.id)) throw createError({ statusCode: 400, statusMessage: 'ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่' })
    await (await getDb()).request().input('user_id', id).query('DELETE FROM dbo.UserInfo WHERE user_id=@user_id')
    return { ok: true }
  } catch (error) { return serverError(error) }
})
