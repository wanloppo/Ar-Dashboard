import bcrypt from 'bcryptjs'
import { getDb, toNullableString } from '../../utils/db'
import { serverError } from '../../utils/http'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const body = await readBody<Record<string, unknown>>(event)
    if (!body.username || !body.full_name || !body.password) throw createError({ statusCode: 400, statusMessage: 'กรุณากรอก username, ชื่อผู้ใช้ และรหัสผ่าน' })
    if (body.password !== body.password_confirmation) throw createError({ statusCode: 400, statusMessage: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน' })
    await (await getDb()).request()
      .input('username', String(body.username).trim()).input('full_name', String(body.full_name).trim())
      .input('email', toNullableString(body.email)).input('role', String(body.role || 'user'))
      .input('password_hash', await bcrypt.hash(String(body.password), 10)).input('is_active', body.is_active !== false)
      .query('INSERT INTO dbo.UserInfo (username, full_name, email, role, password_hash, is_active) VALUES (@username,@full_name,@email,@role,@password_hash,@is_active)')
    return { ok: true }
  } catch (error) { return serverError(error) }
})
