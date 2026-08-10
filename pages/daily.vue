<script setup lang="ts">
import type { CreditInvoiceResponse, CreditInvoiceRow } from '~/types/credit-invoice'
definePageMeta({ middleware: 'auth' })

function todayString() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const get = (type: string) => parts.find(part => part.type === type)?.value || ''
  return `${get('year')}-${get('month')}-${get('day')}`
}
const from = ref(todayString())
const to = ref(todayString())
const bank = ref('all')
const search = ref('')
const banks = ref<Array<string | null>>([])
const response = ref<CreditInvoiceResponse>({ items: [], total: 0, page: 1, pageSize: 50 })
const page = ref(1)
const pageSize = ref(50)
const sort = ref('ih_invdate')
const order = ref<'asc' | 'desc'>('desc')
const loading = ref(true)
const errorMessage = ref('')
const totalPages = computed(() => Math.max(1, Math.ceil(response.value.total / response.value.pageSize)))
const money = (value: number | null) => value === null || value === undefined ? '—' : new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
const date = (value: string | null) => value ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value)) : '—'
const rowKey = (row: CreditInvoiceRow) => `${row.ih_bank}-${row.ih_docno}-${row.ih_date}-${row.ih_refdocno}`

async function load(reset = false) {
  if (reset) page.value = 1
  errorMessage.value = ''
  if (from.value > to.value) { errorMessage.value = 'วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด'; return }
  loading.value = true
  try {
    response.value = await $fetch('/api/credit-invoices', { query: {
      from: from.value, to: to.value, bank: bank.value, search: search.value,
      page: page.value, pageSize: pageSize.value, sort: sort.value, order: order.value
    } })
  } catch (error: any) {
    response.value = { items: [], total: 0, page: page.value, pageSize: pageSize.value }
    errorMessage.value = error?.data?.statusMessage || 'โหลดรายละเอียด CreditInvoice ไม่สำเร็จ'
  } finally { loading.value = false }
}
function setSort(field: string) {
  if (sort.value === field) order.value = order.value === 'asc' ? 'desc' : 'asc'
  else { sort.value = field; order.value = 'asc' }
  void load(true)
}
function sortMark(field: string) { return sort.value === field ? (order.value === 'asc' ? ' ↑' : ' ↓') : '' }
async function changePage(next: number) { page.value = Math.min(totalPages.value, Math.max(1, next)); await load() }
onMounted(async () => {
  try { banks.value = await $fetch('/api/banks') } catch { banks.value = [] }
  await load()
})
</script>

<template>
  <div class="space-y-6">
    <section><p class="mb-2 text-xs font-bold uppercase tracking-[.2em] text-teal">Workspace / Daily detail</p><h1 class="text-3xl font-bold tracking-tight sm:text-4xl">รายละเอียดรายวัน</h1><p class="mt-2 text-sm text-slate-500">รายการ CreditInvoice ค้นหาตาม ih_invdate พร้อมข้อมูล BankInvoice ที่จับคู่ตามธนาคารและวันที่ใบแจ้งหนี้</p></section>
    <form class="panel grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.1fr_1.5fr_auto]" @submit.prevent="load(true)">
      <DateField v-model="from" label="วันที่เริ่มต้น" required />
      <DateField v-model="to" label="วันที่สิ้นสุด" required />
      <label><span class="label">ธนาคาร</span><select v-model="bank" class="field"><option value="all">ทั้งหมด</option><option value="qr">กลุ่ม QR</option><option v-for="item in banks" :key="item || '__NULL__'" :value="item === null ? '__NULL__' : item">{{ item || 'ไม่ระบุธนาคาร' }}</option></select></label>
      <label><span class="label">ค้นหา</span><input v-model.trim="search" class="field" maxlength="100" placeholder="เลขเอกสาร, อ้างอิง, merchant..." /></label>
      <button class="btn-primary self-end" :disabled="loading">{{ loading ? 'กำลังค้นหา...' : 'ค้นหา' }}</button>
    </form>
    <div v-if="errorMessage" class="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">{{ errorMessage }}</div>
    <section class="panel overflow-hidden">
      <div class="flex flex-col justify-between gap-3 border-b border-mist p-5 sm:flex-row sm:items-center"><div><p class="font-bold">รายการ CreditInvoice</p><p class="mt-1 text-xs text-slate-500">{{ response.total.toLocaleString('th-TH') }} รายการ</p></div><label class="flex items-center gap-2 text-xs text-slate-500">แสดง<select v-model.number="pageSize" class="rounded-lg border border-mist px-2 py-1.5" @change="load(true)"><option :value="25">25</option><option :value="50">50</option><option :value="100">100</option></select>รายการ</label></div>
      <div class="overflow-x-auto"><table class="w-full min-w-[1760px] text-left text-xs">
        <thead class="bg-paper text-[11px] uppercase tracking-wide text-slate-500">
          <tr class="border-b border-mist"><th colspan="11" class="px-4 py-2 text-center text-teal">CreditInvoice</th><th colspan="7" class="border-l border-mist px-4 py-2 text-center text-ink">BankInvoice</th></tr>
          <tr>
            <th class="px-4 py-3"><button @click="setSort('ih_bank')">ธนาคาร{{ sortMark('ih_bank') }}</button></th>
            <th class="px-4 py-3"><button @click="setSort('ih_date')">วันที่เอกสาร{{ sortMark('ih_date') }}</button></th>
            <th class="px-4 py-3"><button @click="setSort('ih_invdate')">วันที่ Invoice{{ sortMark('ih_invdate') }}</button></th><th class="px-4 py-3"><button @click="setSort('ih_docno')">Doc No{{ sortMark('ih_docno') }}</button></th>
            <th class="px-4 py-3">สาขา</th><th class="px-4 py-3">เลขอ้างอิง</th><th class="px-4 py-3">สถานะ</th><th class="px-4 py-3">ผู้บันทึก</th>
            <th class="px-4 py-3 text-right"><button @click="setSort('ih_total')">Total{{ sortMark('ih_total') }}</button></th><th class="px-4 py-3 text-right">Commission</th><th class="px-4 py-3 text-right">VAT</th>
            <th class="border-l border-mist px-4 py-3"><button @click="setSort('invoice_date')">วันที่ Invoice{{ sortMark('invoice_date') }}</button></th><th class="px-4 py-3">Merchant</th><th class="px-4 py-3">Invoice No</th>
            <th class="px-4 py-3 text-right"><button @click="setSort('bank_total')">Total{{ sortMark('bank_total') }}</button></th><th class="px-4 py-3 text-right">Commission</th><th class="px-4 py-3 text-right">VAT</th><th class="px-4 py-3 text-right">Net</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-mist">
          <tr v-if="loading"><td colspan="18" class="px-5 py-14 text-center text-slate-400">กำลังโหลดข้อมูล...</td></tr>
          <tr v-else-if="!response.items.length"><td colspan="18" class="px-5 py-14 text-center text-slate-400">ไม่พบข้อมูลตามเงื่อนไข</td></tr>
          <tr v-for="row in response.items" v-else :key="rowKey(row)" class="hover:bg-paper/70">
            <td class="whitespace-nowrap px-4 py-3 font-semibold">{{ row.ih_bank || 'ไม่ระบุ' }}</td><td class="whitespace-nowrap px-4 py-3">{{ date(row.ih_date) }}</td><td class="whitespace-nowrap px-4 py-3">{{ date(row.ih_invdate) }}</td>
            <td class="px-4 py-3 font-mono">{{ row.ih_docno }}</td><td class="px-4 py-3">{{ row.ih_refbrcode || '—' }}</td><td class="px-4 py-3">{{ row.ih_refdocno || '—' }}</td>
            <td class="px-4 py-3"><span class="rounded-full bg-mist px-2 py-1 font-semibold">{{ row.ih_status || '—' }}</span></td><td class="px-4 py-3">{{ row.ih_luser || '—' }}</td>
            <td class="px-4 py-3 text-right font-semibold">{{ money(row.ih_total) }}</td><td class="px-4 py-3 text-right">{{ money(row.ih_com) }}</td><td class="px-4 py-3 text-right">{{ money(row.ih_vat) }}</td>
            <td class="whitespace-nowrap border-l border-mist px-4 py-3">{{ date(row.invoice_date) }}</td><td class="px-4 py-3">{{ row.merchant_id || '—' }}</td><td class="px-4 py-3">{{ row.invoice_no || '—' }}</td>
            <td class="px-4 py-3 text-right font-semibold">{{ money(row.bank_total) }}</td><td class="px-4 py-3 text-right">{{ money(row.bank_com) }}</td><td class="px-4 py-3 text-right">{{ money(row.bank_vat) }}</td><td class="px-4 py-3 text-right">{{ money(row.bank_net) }}</td>
          </tr>
        </tbody>
      </table></div>
      <div class="flex flex-col items-center justify-between gap-3 border-t border-mist p-4 sm:flex-row"><p class="text-xs text-slate-500">หน้า {{ response.page }} จาก {{ totalPages }}</p><div class="flex gap-2"><button class="btn-secondary px-3 py-2" :disabled="page <= 1 || loading" @click="changePage(page - 1)">ก่อนหน้า</button><button class="btn-secondary px-3 py-2" :disabled="page >= totalPages || loading" @click="changePage(page + 1)">ถัดไป</button></div></div>
    </section>
  </div>
</template>
