import { getDb } from '../utils/db'
import { serverError } from '../utils/http'
import { requireUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await requireUser(event)
    const result = await (await getDb()).request().query(`
      SELECT bank
      FROM (
        SELECT DISTINCT ih_bank AS bank FROM dbo.CreditInvoice
        UNION SELECT 'KBAL'
        UNION SELECT DISTINCT invoice_type FROM dbo.vBankInvoice
      ) banks
      ORDER BY CASE WHEN bank IS NULL THEN 1 ELSE 0 END, bank
    `)
    return result.recordset.map(row => row.bank as string | null)
  } catch (error) { return serverError(error) }
})
