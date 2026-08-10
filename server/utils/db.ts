import sql from 'mssql'

let pool: sql.ConnectionPool | null = null

export async function getDb() {
  if (pool?.connected) return pool
  const config = useRuntimeConfig()
  const server = process.env.MSSQL_SERVER || config.mssqlServer
  const database = process.env.MSSQL_DATABASE || config.mssqlDatabase || 'arvl'
  const user = process.env.MSSQL_USER || config.mssqlUser
  const password = process.env.MSSQL_PASSWORD || config.mssqlPassword
  if (!server || !user || !password) throw createError({ statusCode: 500, statusMessage: 'ยังไม่ได้กำหนดค่าเชื่อมต่อ MSSQL' })
  const encryptValue = process.env.MSSQL_ENCRYPT || config.mssqlEncrypt || 'false'
  pool = await sql.connect({
    server: String(server),
    database: String(database),
    user: String(user),
    password: String(password),
    port: Number(process.env.MSSQL_PORT || config.mssqlPort || 1433),
    options: { encrypt: String(encryptValue).toLowerCase() !== 'false', trustServerCertificate: true },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
  })
  return pool
}

export function toNullableString(value: unknown) {
  return value === undefined || value === null || value === '' ? null : String(value)
}
