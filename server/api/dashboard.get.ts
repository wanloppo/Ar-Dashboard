import { getDb } from '../utils/db'
import { serverError } from '../utils/http'
import { requirePermission } from '../utils/auth'
import { asNumber, bankPredicate, bindReportFilters, creditInvoiceCte, parseReportFilters } from '../utils/report'

export default defineEventHandler(async (event) => {
  try {
    await requirePermission(event, 'creditinvoice_dashboard', 'query')
    const filters = parseReportFilters(getQuery(event))
    const creditWhere = `ci.ih_invdate >= CONVERT(date,@from,23) AND ci.ih_invdate < DATEADD(day,1,CONVERT(date,@to,23)) AND ${bankPredicate('ci.ih_bank', filters.bank)}`
    const bankWhere = `bi.invoice_date >= CONVERT(date,@from,23) AND bi.invoice_date < DATEADD(day,1,CONVERT(date,@to,23)) AND ${bankPredicate('bi.invoice_type', filters.bank)}`
    const request = bindReportFilters((await getDb()).request(), filters)
    const result = await request.query(`
      ${creditInvoiceCte}
      SELECT COUNT_BIG(*) item_count, ISNULL(SUM(ci.ih_total),0) total,
        ISNULL(SUM(ci.ih_com),0) commission, ISNULL(SUM(ci.ih_vat),0) vat,
        ISNULL(SUM(ci.ih_total-ci.ih_com-ci.ih_vat),0) net
      FROM credit_invoice ci WHERE ${creditWhere};

      SELECT COUNT_BIG(*) item_count, ISNULL(SUM(bi.total),0) total,
        ISNULL(SUM(bi.com),0) commission, ISNULL(SUM(bi.vat),0) vat, ISNULL(SUM(bi.net),0) net
      FROM dbo.vBankInvoice bi WHERE ${bankWhere};

      ${creditInvoiceCte},
      credit_daily AS (
        SELECT CAST(ci.ih_invdate AS date) activity_date, SUM(ci.ih_total) total
        FROM credit_invoice ci WHERE ${creditWhere} GROUP BY CAST(ci.ih_invdate AS date)
      ),
      bank_daily AS (
        SELECT CAST(bi.invoice_date AS date) activity_date, SUM(bi.total) total
        FROM dbo.vBankInvoice bi WHERE ${bankWhere} GROUP BY CAST(bi.invoice_date AS date)
      )
      SELECT COALESCE(c.activity_date,b.activity_date) activity_date,
        ISNULL(c.total,0) credit_total, ISNULL(b.total,0) bank_total
      FROM credit_daily c FULL OUTER JOIN bank_daily b ON b.activity_date=c.activity_date
      ORDER BY activity_date;

      ${creditInvoiceCte},
      credit_banks AS (
        SELECT ci.ih_bank bank, COUNT_BIG(*) item_count, SUM(ci.ih_total) total
        FROM credit_invoice ci WHERE ${creditWhere} GROUP BY ci.ih_bank
      ),
      bank_banks AS (
        SELECT bi.invoice_type bank, COUNT_BIG(*) item_count, SUM(bi.total) total
        FROM dbo.vBankInvoice bi WHERE ${bankWhere} GROUP BY bi.invoice_type
      )
      SELECT COALESCE(c.bank,b.bank) bank,
        ISNULL(c.item_count,0) credit_count, ISNULL(c.total,0) credit_total,
        ISNULL(b.item_count,0) bank_count, ISNULL(b.total,0) bank_total
      FROM credit_banks c FULL OUTER JOIN bank_banks b ON ISNULL(b.bank,'')=ISNULL(c.bank,'')
      ORDER BY CASE WHEN COALESCE(c.bank,b.bank) IS NULL THEN 1 ELSE 0 END, COALESCE(c.bank,b.bank);
    `)
    const recordsets = result.recordsets as unknown as Array<Array<Record<string, unknown>>>
    const summary = (row: Record<string, unknown>) => ({
      count: asNumber(row.item_count), total: asNumber(row.total), commission: asNumber(row.commission),
      vat: asNumber(row.vat), net: asNumber(row.net)
    })
    return {
      creditInvoice: summary(recordsets[0]?.[0] || {}),
      bankInvoice: summary(recordsets[1]?.[0] || {}),
      daily: (recordsets[2] || []).map(row => ({ date: row.activity_date, credit_total: asNumber(row.credit_total), bank_total: asNumber(row.bank_total) })),
      banks: (recordsets[3] || []).map(row => ({
        bank: row.bank ?? null, credit_count: asNumber(row.credit_count), credit_total: asNumber(row.credit_total),
        bank_count: asNumber(row.bank_count), bank_total: asNumber(row.bank_total)
      }))
    }
  } catch (error) { return serverError(error) }
})
