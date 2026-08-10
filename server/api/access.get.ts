import { getDb } from '../utils/db'
import { serverError } from '../utils/http'
import { requireAdmin } from '../utils/auth'
export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const userId = Number(getQuery(event).user_id)
    if (!userId) throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุผู้ใช้งาน' })
    const result = await (await getDb()).request().input('user_id', userId).query(`
      SELECT s.screen_id,s.screen_eng_name,s.screen_tha_name,
        s.insert_active screen_insert_active,s.update_active screen_update_active,s.delete_active screen_delete_active,
        s.query_active screen_query_active,s.report_active screen_report_active,s.process_active screen_process_active,
        CONVERT(BIT,CASE WHEN a.user_id IS NULL THEN 1 ELSE a.insert_active END) insert_active,
        CONVERT(BIT,CASE WHEN a.user_id IS NULL THEN 1 ELSE a.update_active END) update_active,
        CONVERT(BIT,CASE WHEN a.user_id IS NULL THEN 1 ELSE a.delete_active END) delete_active,
        CONVERT(BIT,CASE WHEN a.user_id IS NULL THEN 1 ELSE a.query_active END) query_active,
        CONVERT(BIT,CASE WHEN a.user_id IS NULL THEN 1 ELSE a.report_active END) report_active,
        CONVERT(BIT,CASE WHEN a.user_id IS NULL THEN 1 ELSE a.process_active END) process_active
      FROM dbo.ScreenInfo s LEFT JOIN dbo.AccessScreenInfo a ON a.screen_id=s.screen_id AND a.user_id=@user_id ORDER BY s.screen_id
    `)
    return result.recordset
  } catch (error) { return serverError(error) }
})
