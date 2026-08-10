import sql from 'mssql'

export const creditInvoiceCte = `
WITH credit_invoice AS (
  SELECT ih_docno, ih_refbrcode, ih_refdocno, ih_date, ih_vat, ih_com, ih_total,
    ih_luser, ih_status,
    CASE WHEN ih_bank = 'SCB' THEN DATEADD(day, 1, ih_date) ELSE ih_invdate END AS ih_invdate,
    ih_bank
  FROM dbo.CreditInvoice
  UNION
  SELECT ih_docno, ih_refbrcode, ih_refdocno, ih_date, ih_vat, ih_com, ih_total,
    ih_luser, ih_status, ih_invdate, 'KBAL' AS ih_bank
  FROM dbo.CreditInvoice_ali
)`

export interface ReportFilters {
  from: string
  to: string
  bank: string
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
}

export function parseReportFilters(query: Record<string, unknown>): ReportFilters {
  const from = String(query.from || '')
  const to = String(query.to || '')
  const bank = String(query.bank || 'all').trim()
  if (!validDate(from) || !validDate(to)) throw createError({ statusCode: 400, statusMessage: 'รูปแบบวันที่ไม่ถูกต้อง' })
  if (from > to) throw createError({ statusCode: 400, statusMessage: 'วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด' })
  if (bank.length > 20) throw createError({ statusCode: 400, statusMessage: 'รหัสธนาคารไม่ถูกต้อง' })
  return { from, to, bank: bank || 'all' }
}

export function bindReportFilters(request: sql.Request, filters: ReportFilters) {
  request.input('from', sql.VarChar(10), filters.from)
  request.input('to', sql.VarChar(10), filters.to)
  if (!['all', 'qr', '__NULL__'].includes(filters.bank)) request.input('bank', sql.VarChar(20), filters.bank)
  return request
}

export function bankPredicate(column: string, bank: string) {
  if (bank === 'all') return '1=1'
  if (bank === 'qr') return `${column} LIKE '%QR'`
  if (bank === '__NULL__') return `${column} IS NULL`
  return `${column} = @bank`
}

export function asNumber(value: unknown) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}
