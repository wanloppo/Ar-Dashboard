import { getDb } from '../utils/db'
import { serverError } from '../utils/http'
import { requireAdmin } from '../utils/auth'
export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    return (await (await getDb()).request().query('SELECT screen_id,screen_eng_name,screen_tha_name,insert_active,update_active,delete_active,query_active,report_active,process_active,created_at FROM dbo.ScreenInfo ORDER BY screen_id')).recordset
  } catch (error) { return serverError(error) }
})
