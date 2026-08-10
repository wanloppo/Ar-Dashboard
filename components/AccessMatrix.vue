<script setup lang="ts">
import type { UserRecord } from '~/types/user'
type ActionKey = 'insert' | 'update' | 'delete' | 'query' | 'report' | 'process'
type AccessRow = { screen_id: number; screen_eng_name: string; screen_tha_name: string } & Record<string, boolean>
const users = ref<UserRecord[]>([])
const userId = ref<number | null>(null)
const rows = ref<AccessRow[]>([])
const loading = ref(false)
const saving = ref(false)
const message = ref('')
const errorMessage = ref('')
const actions: Array<{ key: ActionKey; label: string }> = [{ key: 'insert', label: 'เพิ่ม' }, { key: 'update', label: 'แก้ไข' }, { key: 'delete', label: 'ลบ' }, { key: 'query', label: 'ค้นหา' }, { key: 'report', label: 'รายงาน' }, { key: 'process', label: 'ประมวลผล' }]
async function loadUsers() { users.value = (await $fetch<UserRecord[]>('/api/users')).filter(u => u.role !== 'admin'); if (users.value[0]) { userId.value = users.value[0].user_id; await loadRows() } }
async function loadRows() { if (!userId.value) return; loading.value = true; try { rows.value = await $fetch('/api/access', { query: { user_id: userId.value } }) } finally { loading.value = false } }
async function save() {
  if (!userId.value) return
  saving.value = true; message.value = ''; errorMessage.value = ''
  try {
    await $fetch('/api/access', { method: 'PUT', body: { user_id: userId.value, entries: rows.value.map(row => ({ screen_id: row.screen_id, ...Object.fromEntries(actions.map(a => [`${a.key}_active`, Boolean(row[`${a.key}_active`])])) })) } })
    message.value = 'บันทึกสิทธิ์เรียบร้อยแล้ว'
  } catch (error: any) { errorMessage.value = error?.data?.statusMessage || 'บันทึกสิทธิ์ไม่สำเร็จ' } finally { saving.value = false }
}
onMounted(loadUsers)
</script>

<template>
  <div class="space-y-6">
    <section class="flex flex-col justify-between gap-4 sm:flex-row"><div><p class="mb-2 text-xs font-bold uppercase tracking-[.2em] text-teal">Security / Access control</p><h1 class="text-3xl font-bold">กำหนดสิทธิ์ผู้ใช้</h1><p class="mt-2 text-sm text-slate-500">กำหนดสิทธิ์รายหน้าจอ ผู้ใช้ใหม่ได้รับสิทธิ์ตามที่หน้าจอรองรับเป็นค่าเริ่มต้น</p></div><button class="btn-primary self-end" :disabled="saving || !rows.length" @click="save">{{ saving ? 'กำลังบันทึก...' : 'บันทึกสิทธิ์' }}</button></section>
    <section class="panel p-5"><label class="block max-w-md"><span class="label">เลือกผู้ใช้งาน</span><select v-model.number="userId" class="field" @change="loadRows"><option v-for="user in users" :key="user.user_id" :value="user.user_id">{{ user.full_name }} ({{ user.username }})</option></select></label><p v-if="!users.length" class="mt-3 text-sm text-slate-500">ยังไม่มีผู้ใช้ทั่วไป</p></section>
    <div v-if="message" class="rounded-xl bg-mint p-4 text-sm font-semibold text-teal">{{ message }}</div><div v-if="errorMessage" class="rounded-xl bg-red-50 p-4 text-sm text-red-700">{{ errorMessage }}</div>
    <section v-if="userId" class="panel overflow-hidden"><div class="overflow-x-auto"><table class="w-full min-w-[860px] text-left text-sm"><thead class="bg-paper text-xs text-slate-500"><tr><th class="px-5 py-3">หน้าจอ</th><th v-for="action in actions" :key="action.key" class="px-3 py-3 text-center">{{ action.label }}</th></tr></thead><tbody class="divide-y divide-mist"><tr v-if="loading"><td colspan="7" class="p-12 text-center">กำลังโหลด...</td></tr><tr v-for="row in rows" v-else :key="row.screen_id"><td class="px-5 py-4"><p class="font-semibold">{{ row.screen_tha_name }}</p><p class="text-xs text-slate-500">{{ row.screen_eng_name }}</p></td><td v-for="action in actions" :key="action.key" class="px-3 py-4 text-center"><input v-model="row[`${action.key}_active`]" type="checkbox" :disabled="!row[`screen_${action.key}_active`]" class="h-4 w-4 accent-teal disabled:opacity-30" /></td></tr></tbody></table></div></section>
  </div>
</template>
