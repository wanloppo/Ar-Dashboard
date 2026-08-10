<script setup lang="ts">
import type { DashboardResponse, MoneySummary } from '~/types/credit-invoice'
definePageMeta({ middleware: 'auth' })

function todayString() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const get = (type: string) => parts.find(part => part.type === type)?.value || ''
  return `${get('year')}-${get('month')}-${get('day')}`
}
const today = todayString()
const from = ref(`${today.slice(0, 7)}-01`)
const to = ref(today)
const bank = ref('all')
const banks = ref<Array<string | null>>([])
const data = ref<DashboardResponse | null>(null)
const loading = ref(true)
const errorMessage = ref('')

const money = (value: number) => new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)
const number = (value: number) => new Intl.NumberFormat('th-TH').format(value || 0)
const displayDate = (value: string) => value ? value.split('-').reverse().join('/') : '—'
const date = (value: string) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
const maxDaily = computed(() => Math.max(1, ...(data.value?.daily.flatMap(item => [item.credit_total, item.bank_total]) || [1])))
const cards = (summary?: MoneySummary) => [
  { label: 'จำนวนรายการ', value: number(summary?.count || 0), suffix: 'รายการ' },
  { label: 'Total', value: money(summary?.total || 0), suffix: 'บาท' },
  { label: 'Commission', value: money(summary?.commission || 0), suffix: 'บาท' },
  { label: 'VAT', value: money(summary?.vat || 0), suffix: 'บาท' },
  { label: 'Net', value: money(summary?.net || 0), suffix: 'บาท' }
]

async function load() {
  errorMessage.value = ''
  if (from.value > to.value) { errorMessage.value = 'วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด'; return }
  loading.value = true
  try { data.value = await $fetch('/api/dashboard', { query: { from: from.value, to: to.value, bank: bank.value } }) }
  catch (error: any) { data.value = null; errorMessage.value = error?.data?.statusMessage || 'โหลดข้อมูลภาพรวมไม่สำเร็จ' }
  finally { loading.value = false }
}
onMounted(async () => {
  try { banks.value = await $fetch('/api/banks') } catch { banks.value = [] }
  await load()
})
</script>

<template>
  <div class="space-y-7">
    <section><p class="mb-2 text-xs font-bold uppercase tracking-[.2em] text-teal">Workspace / Overview</p><h1 class="text-3xl font-bold tracking-tight sm:text-4xl">ภาพรวม CreditInvoice</h1><p class="mt-2 text-sm text-slate-500">สรุปยอดธุรกรรม CreditInvoice และ BankInvoice แยกตามช่วงเวลา</p></section>
    <form class="panel grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.3fr_auto]" @submit.prevent="load">
      <DateField v-model="from" label="วันที่เริ่มต้น" required />
      <DateField v-model="to" label="วันที่สิ้นสุด" required />
      <label><span class="label">ธนาคาร</span><select v-model="bank" class="field"><option value="all">ทั้งหมด</option><option value="qr">กลุ่ม QR</option><option v-for="item in banks" :key="item || '__NULL__'" :value="item === null ? '__NULL__' : item">{{ item || 'ไม่ระบุธนาคาร' }}</option></select></label>
      <button class="btn-primary self-end" :disabled="loading">{{ loading ? 'กำลังโหลด...' : 'แสดงข้อมูล' }}</button>
    </form>
    <div v-if="errorMessage" class="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">{{ errorMessage }}</div>

    <section class="grid gap-5 xl:grid-cols-2">
      <div v-for="source in [{ key: 'credit', title: 'CreditInvoice', copy: 'วันที่ Invoice (ih_invdate)', summary: data?.creditInvoice, tone: 'bg-teal' }, { key: 'bank', title: 'BankInvoice', copy: 'วันที่ใบแจ้งหนี้ (invoice_date)', summary: data?.bankInvoice, tone: 'bg-ink' }]" :key="source.key" class="panel overflow-hidden">
        <div :class="[source.tone, 'flex items-center justify-between px-5 py-4 text-white']"><div><h2 class="text-lg font-bold">{{ source.title }}</h2><p class="text-xs text-white/60">{{ source.copy }}</p></div><span class="rounded-full bg-white/10 px-3 py-1 text-xs">{{ displayDate(from) }} — {{ displayDate(to) }}</span></div>
        <div class="grid grid-cols-2 gap-px bg-mist sm:grid-cols-5">
          <div v-for="item in cards(source.summary)" :key="item.label" class="bg-white p-4"><p class="text-xs text-slate-500">{{ item.label }}</p><p class="mt-2 break-words text-lg font-bold">{{ loading ? '—' : item.value }}</p><p class="mt-1 text-[10px] text-slate-400">{{ item.suffix }}</p></div>
        </div>
      </div>
    </section>

    <section class="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
      <div class="panel overflow-hidden">
        <div class="border-b border-mist p-5"><h2 class="font-bold">แนวโน้มยอดรายวัน</h2><p class="mt-1 text-xs text-slate-500">CreditInvoice ใช้ ih_invdate และ BankInvoice ใช้ invoice_date</p></div>
        <div v-if="loading" class="p-12 text-center text-sm text-slate-400">กำลังโหลดข้อมูล...</div>
        <div v-else-if="!data?.daily.length" class="p-12 text-center text-sm text-slate-400">ไม่พบข้อมูลในช่วงวันที่เลือก</div>
        <div v-else class="space-y-4 p-5">
          <div class="flex gap-5 text-xs"><span class="flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-full bg-teal" /> CreditInvoice</span><span class="flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-full bg-ink" /> BankInvoice</span></div>
          <div v-for="item in data.daily" :key="item.date" class="grid grid-cols-[82px_1fr] items-center gap-3">
            <span class="text-xs text-slate-500">{{ date(item.date) }}</span>
            <div class="space-y-1.5"><div class="h-3 rounded-r-full bg-teal" :style="{ width: `${Math.max(1, item.credit_total / maxDaily * 100)}%` }" :title="`CreditInvoice ${money(item.credit_total)}`" /><div class="h-3 rounded-r-full bg-ink" :style="{ width: `${Math.max(1, item.bank_total / maxDaily * 100)}%` }" :title="`BankInvoice ${money(item.bank_total)}`" /></div>
          </div>
        </div>
      </div>
      <div class="panel overflow-hidden">
        <div class="border-b border-mist p-5"><h2 class="font-bold">สรุปตามธนาคาร</h2><p class="mt-1 text-xs text-slate-500">จำนวนรายการและยอด Total</p></div>
        <div class="max-h-[520px] overflow-auto"><table class="w-full text-left text-sm"><thead class="sticky top-0 bg-paper text-xs text-slate-500"><tr><th class="px-4 py-3">ธนาคาร</th><th class="px-4 py-3 text-right">CreditInvoice</th><th class="px-4 py-3 text-right">BankInvoice</th></tr></thead><tbody class="divide-y divide-mist"><tr v-for="item in data?.banks || []" :key="item.bank || '__NULL__'"><td class="px-4 py-3 font-semibold">{{ item.bank || 'ไม่ระบุ' }}</td><td class="px-4 py-3 text-right"><p>{{ money(item.credit_total) }}</p><p class="text-[10px] text-slate-400">{{ number(item.credit_count) }} รายการ</p></td><td class="px-4 py-3 text-right"><p>{{ money(item.bank_total) }}</p><p class="text-[10px] text-slate-400">{{ number(item.bank_count) }} รายการ</p></td></tr><tr v-if="!loading && !data?.banks.length"><td colspan="3" class="p-12 text-center text-slate-400">ไม่พบข้อมูล</td></tr></tbody></table></div>
      </div>
    </section>
  </div>
</template>
