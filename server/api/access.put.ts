import { getDb } from '../utils/db'
import { serverError } from '../utils/http'
import { requireAdmin } from '../utils/auth'
interface Body { user_id?: unknown; entries?: Array<Record<string, unknown>> }
export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const body = await readBody<Body>(event)
    const userId = Number(body.user_id)
    if (!userId || !Array.isArray(body.entries)) throw createError({ statusCode: 400, statusMessage: 'ข้อมูลสิทธิ์ไม่ถูกต้อง' })
    const db = await getDb()
    for (const entry of body.entries) {
      const screenId = Number(entry.screen_id)
      if (!screenId) continue
      await db.request().input('user_id', userId).input('screen_id', screenId)
        .input('i', Boolean(entry.insert_active)).input('u', Boolean(entry.update_active)).input('d', Boolean(entry.delete_active))
        .input('q', Boolean(entry.query_active)).input('r', Boolean(entry.report_active)).input('p', Boolean(entry.process_active))
        .query(`
          UPDATE dbo.AccessScreenInfo SET insert_active=@i,update_active=@u,delete_active=@d,query_active=@q,report_active=@r,process_active=@p,updated_at=GETDATE() WHERE user_id=@user_id AND screen_id=@screen_id;
          IF @@ROWCOUNT=0 INSERT INTO dbo.AccessScreenInfo (user_id,screen_id,insert_active,update_active,delete_active,query_active,report_active,process_active,updated_at) VALUES (@user_id,@screen_id,@i,@u,@d,@q,@r,@p,GETDATE());
        `)
    }
    return { ok: true }
  } catch (error) { return serverError(error) }
})
