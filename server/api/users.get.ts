import { getDb } from '../utils/db'
import { serverError } from '../utils/http'
import { requireUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireUser(event)
    const result = await (await getDb()).request().input('user_id', Number(user.id)).input('is_admin', user.role === 'admin').query(`
      SELECT user_id, username, full_name, email, role, is_active, created_at
      FROM dbo.UserInfo WHERE @is_admin=1 OR user_id=@user_id ORDER BY full_name, username
    `)
    return result.recordset
  } catch (error) { return serverError(error) }
})
