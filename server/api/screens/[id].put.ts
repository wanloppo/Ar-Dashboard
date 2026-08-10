import { getDb } from '../../utils/db'
import { serverError } from '../../utils/http'
import { requireAdmin } from '../../utils/auth'
export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody<Record<string, unknown>>(event)
    if (!id || !body.screen_eng_name || !body.screen_tha_name) throw createError({ statusCode: 400, statusMessage: 'ข้อมูลหน้าจอไม่ถูกต้อง' })
    await (await getDb()).request().input('id', id).input('eng', String(body.screen_eng_name).trim()).input('thai', String(body.screen_tha_name).trim())
      .input('i', Boolean(body.insert_active)).input('u', Boolean(body.update_active)).input('d', Boolean(body.delete_active))
      .input('q', Boolean(body.query_active)).input('r', Boolean(body.report_active)).input('p', Boolean(body.process_active))
      .query('UPDATE dbo.ScreenInfo SET screen_eng_name=@eng,screen_tha_name=@thai,insert_active=@i,update_active=@u,delete_active=@d,query_active=@q,report_active=@r,process_active=@p WHERE screen_id=@id')
    return { ok: true }
  } catch (error) { return serverError(error) }
})
