import bcrypt from 'bcryptjs'
import sql from 'mssql'
import { getDb, toNullableString } from '../../utils/db'
import { serverError } from '../../utils/http'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    if (!id) throw createError({ statusCode: 400, statusMessage: 'รหัสผู้ใช้ไม่ถูกต้อง' })
    const body = await readBody<Record<string, unknown>>(event)
    const current = await requireUser(event)
    if (current.role !== 'admin') {
      if (id !== Number(current.id)) throw createError({ statusCode: 403, statusMessage: 'คุณแก้ไขได้เฉพาะรหัสผ่านของตัวเอง' })
      if (!body.password || body.password !== body.password_confirmation) throw createError({ statusCode: 400, statusMessage: 'กรุณากรอกรหัสผ่านและยืนยันให้ตรงกัน' })
      await (await getDb()).request().input('user_id', id).input('password_hash', sql.NVarChar(255), await bcrypt.hash(String(body.password), 10)).query('UPDATE dbo.UserInfo SET password_hash=@password_hash WHERE user_id=@user_id')
      return { ok: true }
    }
    if (!body.username || !body.full_name) throw createError({ statusCode: 400, statusMessage: 'กรุณากรอก username และชื่อผู้ใช้' })
    if (body.password && body.password !== body.password_confirmation) throw createError({ statusCode: 400, statusMessage: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน' })
    await (await getDb()).request().input('user_id', id).input('username', String(body.username).trim())
      .input('full_name', String(body.full_name).trim()).input('email', toNullableString(body.email))
      .input('role', String(body.role || 'user')).input('is_active', body.is_active !== false)
      .input('password_hash', sql.NVarChar(255), body.password ? await bcrypt.hash(String(body.password), 10) : null)
      .query('UPDATE dbo.UserInfo SET username=@username,full_name=@full_name,email=@email,role=@role,is_active=@is_active,password_hash=COALESCE(@password_hash,password_hash) WHERE user_id=@user_id')
    return { ok: true }
  } catch (error) { return serverError(error) }
})
