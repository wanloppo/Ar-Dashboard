import sql from 'mssql'
import { getDb } from '../utils/db'
import { serverError } from '../utils/http'
import { requirePermission } from '../utils/auth'
import { asNumber, bankPredicate, bindReportFilters, creditInvoiceCte, parseReportFilters } from '../utils/report'

const sortColumns: Record<string, string> = {
  ih_date: 'ci.ih_date', ih_invdate: 'ci.ih_invdate', ih_bank: 'ci.ih_bank', ih_docno: 'ci.ih_docno',
  ih_total: 'ci.ih_total', invoice_date: 'bi.invoice_date', bank_total: 'bi.total'
}

export default defineEventHandler(async (event) => {
  try {
    await requirePermission(event, 'creditinvoice_daily', 'query')
    const query = getQuery(event)
    const filters = parseReportFilters(query)
    const requestedPage = Number(query.page)
    const requestedPageSize = Number(query.pageSize)
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? Math.min(1_000_000, requestedPage) : 1
    const pageSize = Number.isInteger(requestedPageSize) ? Math.min(100, Math.max(10, requestedPageSize)) : 50
    const sort = sortColumns[String(query.sort || '')] || sortColumns.ih_invdate
    const order = String(query.order || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC'
    const search = String(query.search || '').trim()
    if (search.length > 100) throw createError({ statusCode: 400, statusMessage: 'คำค้นหายาวเกินไป' })
    const where = `
      ci.ih_invdate >= CONVERT(date,@from,23)
      AND ci.ih_invdate < DATEADD(day,1,CONVERT(date,@to,23))
      AND ${bankPredicate('ci.ih_bank', filters.bank)}
      AND (@search='%%' OR CONCAT(ci.ih_docno,' ',ci.ih_refbrcode,' ',ci.ih_refdocno,' ',ci.ih_luser,' ',ci.ih_status,' ',ci.ih_bank,' ',bi.merchant_id,' ',bi.invoice_no) LIKE @search)
    `
    const request = bindReportFilters((await getDb()).request(), filters)
      .input('search', sql.NVarChar(202), `%${search}%`)
      .input('offset', sql.Int, (page - 1) * pageSize)
      .input('pageSize', sql.Int, pageSize)
    const result = await request.query(`
      ${creditInvoiceCte}
      SELECT COUNT_BIG(*) total_count
      FROM credit_invoice ci
      LEFT JOIN dbo.vBankInvoice bi ON ci.ih_bank=bi.invoice_type AND ci.ih_invdate=bi.invoice_date AND ci.ih_date=bi.doc_date
      WHERE ${where};

      ${creditInvoiceCte}
      SELECT ci.ih_bank,ci.ih_date,ci.ih_invdate,ci.ih_docno,RTRIM(ci.ih_refbrcode) ih_refbrcode,
        ci.ih_refdocno,ci.ih_status,ci.ih_luser,ci.ih_total,ci.ih_com,ci.ih_vat,
        bi.invoice_date,bi.merchant_id,bi.invoice_no,
        bi.total bank_total,bi.com bank_com,bi.vat bank_vat,bi.net bank_net
      FROM credit_invoice ci
      LEFT JOIN dbo.vBankInvoice bi ON ci.ih_bank=bi.invoice_type AND ci.ih_invdate=bi.invoice_date AND ci.ih_date=bi.doc_date
      WHERE ${where}
      ORDER BY ${sort} ${order}, ci.ih_docno DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
    `)
    const recordsets = result.recordsets as unknown as Array<Array<Record<string, unknown>>>
    return { items: recordsets[1] || [], total: asNumber(recordsets[0]?.[0]?.total_count), page, pageSize }
  } catch (error) { return serverError(error) }
})
