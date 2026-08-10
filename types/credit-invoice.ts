export interface MoneySummary {
  count: number
  total: number
  commission: number
  vat: number
  net: number
}

export interface DashboardResponse {
  creditInvoice: MoneySummary
  bankInvoice: MoneySummary
  daily: Array<{ date: string; credit_total: number; bank_total: number }>
  banks: Array<{
    bank: string | null
    credit_count: number
    credit_total: number
    bank_count: number
    bank_total: number
  }>
}

export interface CreditInvoiceRow {
  ih_bank: string | null
  ih_date: string
  ih_invdate: string | null
  ih_docno: number
  ih_refbrcode: string | null
  ih_refdocno: string
  ih_status: string
  ih_luser: string
  ih_total: number
  ih_com: number
  ih_vat: number
  invoice_date: string | null
  merchant_id: string | null
  invoice_no: string | null
  bank_total: number | null
  bank_com: number | null
  bank_vat: number | null
  bank_net: number | null
}

export interface CreditInvoiceResponse {
  items: CreditInvoiceRow[]
  total: number
  page: number
  pageSize: number
}
