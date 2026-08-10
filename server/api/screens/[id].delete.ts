import { getDb } from '../../utils/db'
import { serverError } from '../../utils/http'
import { requireAdmin } from '../../utils/auth'
export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (!id) throw createError({ statusCode: 400, statusMessage: 'รหัสหน้าจอไม่ถูกต้อง' })
    await (await getDb()).request().input('id', id).query('DELETE FROM dbo.AccessScreenInfo WHERE screen_id=@id; DELETE FROM dbo.ScreenInfo WHERE screen_id=@id')
    return { ok: true }
  } catch (error) { return serverError(error) }
})
