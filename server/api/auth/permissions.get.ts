import { getDb } from '../../utils/db'
import { serverError } from '../../utils/http'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireUser(event)
    if (user.role === 'admin') {
      const result = await (await getDb()).request().query('SELECT screen_eng_name, insert_active, update_active, delete_active, query_active, report_active, process_active FROM dbo.ScreenInfo ORDER BY screen_id')
      return { role: 'admin', screens: result.recordset }
    }
    const result = await (await getDb()).request().input('user_id', Number(user.id)).query(`
      SELECT s.screen_eng_name,
        CONVERT(BIT, CASE WHEN s.insert_active=1 AND (a.user_id IS NULL OR a.insert_active=1) THEN 1 ELSE 0 END) insert_active,
        CONVERT(BIT, CASE WHEN s.update_active=1 AND (a.user_id IS NULL OR a.update_active=1) THEN 1 ELSE 0 END) update_active,
        CONVERT(BIT, CASE WHEN s.delete_active=1 AND (a.user_id IS NULL OR a.delete_active=1) THEN 1 ELSE 0 END) delete_active,
        CONVERT(BIT, CASE WHEN s.query_active=1 AND (a.user_id IS NULL OR a.query_active=1) THEN 1 ELSE 0 END) query_active,
        CONVERT(BIT, CASE WHEN s.report_active=1 AND (a.user_id IS NULL OR a.report_active=1) THEN 1 ELSE 0 END) report_active,
        CONVERT(BIT, CASE WHEN s.process_active=1 AND (a.user_id IS NULL OR a.process_active=1) THEN 1 ELSE 0 END) process_active
      FROM dbo.ScreenInfo s LEFT JOIN dbo.AccessScreenInfo a ON a.screen_id=s.screen_id AND a.user_id=@user_id ORDER BY s.screen_id
    `)
    return { role: user.role || 'user', screens: result.recordset }
  } catch (error) { return serverError(error) }
})
