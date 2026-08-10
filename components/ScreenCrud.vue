<script setup lang="ts">
import type { ScreenRecord } from '~/types/screen'
type ActionKey = 'insert' | 'update' | 'delete' | 'query' | 'report' | 'process'
const screens = ref<ScreenRecord[]>([])
const loading = ref(true)
const modal = ref(false)
const editing = ref<ScreenRecord | null>(null)
const errorMessage = ref('')
const form = reactive<Record<string, string | boolean>>({ screen_eng_name: '', screen_tha_name: '', insert_active: false, update_active: false, delete_active: false, query_active: true, report_active: false, process_active: false })
const actions: Array<{ key: ActionKey; label: string }> = [{ key: 'insert', label: 'เพิ่ม' }, { key: 'update', label: 'แก้ไข' }, { key: 'delete', label: 'ลบ' }, { key: 'query', label: 'ค้นหา' }, { key: 'report', label: 'รายงาน' }, { key: 'process', label: 'ประมวลผล' }]
async function load() { loading.value = true; try { screens.value = await $fetch('/api/screens') } finally { loading.value = false } }
function open(item?: ScreenRecord) {
  editing.value = item || null; errorMessage.value = ''
  Object.assign(form, item || { screen_eng_name: '', screen_tha_name: '', insert_active: false, update_active: false, delete_active: false, query_active: true, report_active: false, process_active: false })
  modal.value = true
}
async function save() {
  try { await $fetch(editing.value ? `/api/screens/${editing.value.screen_id}` : '/api/screens', { method: editing.value ? 'PUT' : 'POST', body: form }); modal.value = false; await load() }
  catch (error: any) { errorMessage.value = error?.data?.statusMessage || 'บันทึกไม่สำเร็จ' }
}
async function remove(item: ScreenRecord) { if (confirm(`ลบหน้าจอ ${item.screen_tha_name} และสิทธิ์ที่เกี่ยวข้อง?`)) { await $fetch(`/api/screens/${item.screen_id}`, { method: 'DELETE' }); await load() } }
onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <section class="flex justify-between gap-4"><div><p class="mb-2 text-xs font-bold uppercase tracking-[.2em] text-teal">Security / Screens</p><h1 class="text-3xl font-bold">หน้าจอระบบ</h1><p class="mt-2 text-sm text-slate-500">กำหนดหน้าจอและฟังก์ชันที่รองรับ</p></div><button class="btn-primary self-end" @click="open()">+ เพิ่มหน้าจอ</button></section>
    <section class="panel overflow-hidden"><div class="overflow-x-auto"><table class="w-full min-w-[760px] text-left text-sm">
      <thead class="bg-paper text-xs text-slate-500"><tr><th class="px-5 py-3">รหัส</th><th class="px-5 py-3">หน้าจอ</th><th class="px-5 py-3">ฟังก์ชัน</th><th class="px-5 py-3 text-right">จัดการ</th></tr></thead>
      <tbody class="divide-y divide-mist"><tr v-if="loading"><td colspan="4" class="p-12 text-center text-slate-400">กำลังโหลด...</td></tr><tr v-for="item in screens" v-else :key="item.screen_id"><td class="px-5 py-4">{{ item.screen_id }}</td><td class="px-5 py-4"><p class="font-semibold">{{ item.screen_tha_name }}</p><p class="text-xs text-slate-500">{{ item.screen_eng_name }}</p></td><td class="px-5 py-4"><span v-for="action in actions.filter(a => item[`${a.key}_active`])" :key="action.key" class="mr-1.5 rounded-full bg-mint px-2.5 py-1 text-xs text-teal">{{ action.label }}</span></td><td class="px-5 py-4 text-right"><button class="mr-2 p-2" @click="open(item)">✎</button><button class="p-2" @click="remove(item)">⌫</button></td></tr></tbody>
    </table></div></section>
    <div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" @click.self="modal = false"><form class="w-full max-w-lg rounded-3xl bg-white p-6" @submit.prevent="save">
      <div class="mb-5 flex justify-between"><h2 class="text-xl font-bold">{{ editing ? 'แก้ไขหน้าจอ' : 'เพิ่มหน้าจอ' }}</h2><button type="button" @click="modal = false">✕</button></div>
      <div v-if="errorMessage" class="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{{ errorMessage }}</div>
      <div class="space-y-4"><label><span class="label">ชื่ออังกฤษ *</span><input v-model="form.screen_eng_name" class="field" required /></label><label><span class="label">ชื่อไทย *</span><input v-model="form.screen_tha_name" class="field" required /></label><div class="grid grid-cols-2 gap-2 sm:grid-cols-3"><label v-for="action in actions" :key="action.key" class="flex items-center gap-2 rounded-xl border border-mist p-3 text-sm"><input v-model="form[`${action.key}_active`]" type="checkbox" />{{ action.label }}</label></div></div>
      <div class="mt-6 flex justify-end gap-3"><button type="button" class="btn-secondary" @click="modal = false">ยกเลิก</button><button class="btn-primary">บันทึก</button></div>
    </form></div>
  </div>
</template>
