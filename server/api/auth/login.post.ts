import bcrypt from 'bcryptjs'
import { getDb } from '../../utils/db'
import { serverError } from '../../utils/http'
import { setUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ username?: string; password?: string }>(event)
    if (!body.username || !body.password) throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' })
    const result = await (await getDb()).request().input('username', body.username.trim()).query(`
      SELECT TOP 1 user_id,username,full_name,email,role,password_hash
      FROM dbo.UserInfo WHERE username=@username AND is_active=1
    `)
    const row = result.recordset[0]
    if (!row || !await bcrypt.compare(body.password, row.password_hash)) throw createError({ statusCode: 401, statusMessage: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
    const user = { id: String(row.user_id), name: row.full_name || row.username, email: row.email || null, role: row.role || 'user' }
    setUserSession(event, user)
    return { user }
  } catch (error) { return serverError(error) }
})
