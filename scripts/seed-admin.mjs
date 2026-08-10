import { existsSync } from 'node:fs'
import sql from 'mssql'
import bcrypt from 'bcryptjs'

if (existsSync('.env')) process.loadEnvFile('.env')
const required = ['MSSQL_SERVER', 'MSSQL_USER', 'MSSQL_PASSWORD', 'ADMIN_USERNAME', 'ADMIN_PASSWORD']
const missing = required.filter(key => !process.env[key])
if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`)

const pool = await sql.connect({
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE || 'arvl',
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  port: Number(process.env.MSSQL_PORT || 1433),
  options: {
    encrypt: String(process.env.MSSQL_ENCRYPT || 'false').toLowerCase() !== 'false',
    trustServerCertificate: true
  }
})

try {
  const username = process.env.ADMIN_USERNAME.trim()
  const fullName = (process.env.ADMIN_FULL_NAME || 'ผู้ดูแลระบบ').trim()
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
  await pool.request()
    .input('username', sql.NVarChar(100), username)
    .input('full_name', sql.NVarChar(200), fullName)
    .input('password_hash', sql.NVarChar(255), passwordHash)
    .query(`
      UPDATE dbo.UserInfo
      SET full_name=@full_name, role='admin', password_hash=@password_hash, is_active=1
      WHERE username=@username;
      IF @@ROWCOUNT=0
        INSERT INTO dbo.UserInfo (username,full_name,role,password_hash,is_active)
        VALUES (@username,@full_name,'admin',@password_hash,1);
    `)
  console.log(`Admin account "${username}" is ready.`)
} finally {
  await pool.close()
}
