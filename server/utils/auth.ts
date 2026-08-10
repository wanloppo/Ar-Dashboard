import type { H3Event } from 'h3'
import { getDb } from './db'
import { getUserSession } from './session'

export interface AuthUser { id: string; name?: string | null; email?: string | null; role?: string | null }
export type ScreenAction = 'insert' | 'update' | 'delete' | 'query' | 'report' | 'process'
const actionColumns: Record<ScreenAction, string> = {
  insert: 'insert_active', update: 'update_active', delete: 'delete_active',
  query: 'query_active', report: 'report_active', process: 'process_active'
}

export async function requireUser(event: H3Event) {
  const user = getUserSession(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' })
  return user
}

export async function requireAdmin(event: H3Event) {
  const user = await requireUser(event)
  if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'คุณไม่มีสิทธิ์สำหรับฟังก์ชันนี้' })
  return user
}

export async function requirePermission(event: H3Event, screen: string, action: ScreenAction) {
  const user = await requireUser(event)
  if (user.role === 'admin') return user
  const column = actionColumns[action]
  const result = await (await getDb()).request().input('user_id', Number(user.id)).input('screen', screen).query(`
    SELECT s.${column} AS screen_flag, a.${column} AS user_flag
    FROM dbo.ScreenInfo s
    LEFT JOIN dbo.AccessScreenInfo a ON a.screen_id=s.screen_id AND a.user_id=@user_id
    WHERE s.screen_eng_name=@screen
  `)
  const row = result.recordset[0]
  if (!row) return user
  const allowed = Boolean(row.screen_flag) && (row.user_flag === null || row.user_flag === undefined || Boolean(row.user_flag))
  if (!allowed) throw createError({ statusCode: 403, statusMessage: 'คุณไม่มีสิทธิ์ใช้งานหน้าจอนี้' })
  return user
}
