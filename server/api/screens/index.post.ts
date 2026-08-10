import { getDb } from '../../utils/db'
import { serverError } from '../../utils/http'
import { requireAdmin } from '../../utils/auth'
export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const body = await readBody<Record<string, unknown>>(event)
    if (!body.screen_eng_name || !body.screen_tha_name) throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกชื่อหน้าจอภาษาอังกฤษและภาษาไทย' })
    await (await getDb()).request().input('eng', String(body.screen_eng_name).trim()).input('thai', String(body.screen_tha_name).trim())
      .input('i', Boolean(body.insert_active)).input('u', Boolean(body.update_active)).input('d', Boolean(body.delete_active))
      .input('q', Boolean(body.query_active)).input('r', Boolean(body.report_active)).input('p', Boolean(body.process_active))
      .query('INSERT INTO dbo.ScreenInfo (screen_eng_name,screen_tha_name,insert_active,update_active,delete_active,query_active,report_active,process_active) VALUES (@eng,@thai,@i,@u,@d,@q,@r,@p)')
    return { ok: true }
  } catch (error) { return serverError(error) }
})
