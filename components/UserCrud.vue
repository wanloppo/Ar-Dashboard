<script setup lang="ts">
import type { UserPayload, UserRecord } from '~/types/user'

const users = ref<UserRecord[]>([])
const loading = ref(true)
const modal = ref(false)
const editing = ref<UserRecord | null>(null)
const errorMessage = ref('')
const form = reactive<UserPayload>({ username: '', full_name: '', email: '', role: 'user', password: '', is_active: true })
const confirmation = ref('')
const { data } = useAuth()
const sessionUser = computed(() => (data.value?.user || {}) as { role?: string; id?: string })
const isAdmin = computed(() => sessionUser.value.role === 'admin')
const isEdit = computed(() => Boolean(editing.value))

async function load() {
  loading.value = true
  try { users.value = await $fetch<UserRecord[]>('/api/users') } catch { users.value = [] } finally { loading.value = false }
}
function openCreate() {
  editing.value = null; confirmation.value = ''; errorMessage.value = ''
  Object.assign(form, { username: '', full_name: '', email: '', role: 'user', password: '', is_active: true })
  modal.value = true
}
function openEdit(user: UserRecord) {
  editing.value = user; confirmation.value = ''; errorMessage.value = ''
  Object.assign(form, { username: user.username, full_name: user.full_name, email: user.email || '', role: user.role, password: '', is_active: Boolean(user.is_active) })
  modal.value = true
}
async function save() {
  errorMessage.value = ''
  if (form.password && form.password !== confirmation.value) { errorMessage.value = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน'; return }
  if (!isAdmin.value && !form.password) { errorMessage.value = 'กรุณาระบุรหัสผ่านใหม่'; return }
  try {
    const body = isAdmin.value
      ? { ...form, password: form.password || undefined, password_confirmation: confirmation.value || undefined }
      : { password: form.password, password_confirmation: confirmation.value }
    await $fetch(isEdit.value ? `/api/users/${editing.value!.user_id}` : '/api/users', { method: isEdit.value ? 'PUT' : 'POST', body })
    modal.value = false
    await load()
  } catch (error: any) { errorMessage.value = error?.data?.statusMessage || 'บันทึกข้อมูลผู้ใช้ไม่สำเร็จ' }
}
async function remove(user: UserRecord) {
  if (!confirm(`ต้องการลบผู้ใช้งาน ${user.username} ใช่หรือไม่?`)) return
  try { await $fetch(`/api/users/${user.user_id}`, { method: 'DELETE' }); await load() } catch (error: any) { alert(error?.data?.statusMessage || 'ลบผู้ใช้งานไม่สำเร็จ') }
}
onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p class="mb-2 text-xs font-bold uppercase tracking-[.2em] text-teal">Administration / Users</p><h1 class="text-3xl font-bold">{{ isAdmin ? 'ผู้ใช้งานระบบ' : 'บัญชีของฉัน' }}</h1><p class="mt-2 text-sm text-slate-500">{{ isAdmin ? 'จัดการบัญชีและสถานะการเข้าใช้งาน' : 'ดูข้อมูลบัญชีและเปลี่ยนรหัสผ่าน' }}</p></div>
      <button v-if="isAdmin" class="btn-primary" @click="openCreate">+ เพิ่มผู้ใช้งาน</button>
    </section>
    <section class="panel overflow-hidden">
      <div class="border-b border-mist p-5"><p class="text-sm font-bold">บัญชีผู้ใช้งาน</p><p class="mt-1 text-xs text-slate-500">{{ users.length }} รายการ</p></div>
      <div class="overflow-x-auto"><table class="w-full min-w-[760px] text-left text-sm">
        <thead class="bg-paper text-[11px] uppercase tracking-wide text-slate-500"><tr><th class="px-5 py-3">ผู้ใช้งาน</th><th class="px-5 py-3">อีเมล</th><th class="px-5 py-3">สิทธิ์</th><th class="px-5 py-3">สถานะ</th><th class="px-5 py-3 text-right">จัดการ</th></tr></thead>
        <tbody class="divide-y divide-mist">
          <tr v-if="loading"><td colspan="5" class="px-5 py-12 text-center text-slate-400">กำลังโหลดข้อมูล...</td></tr>
          <tr v-else-if="!users.length"><td colspan="5" class="px-5 py-12 text-center text-slate-400">ไม่พบผู้ใช้งาน</td></tr>
          <tr v-for="user in users" v-else :key="user.user_id" class="hover:bg-paper/70">
            <td class="px-5 py-4"><p class="font-semibold">{{ user.full_name }}</p><p class="text-xs text-slate-500">{{ user.username }}</p></td>
            <td class="px-5 py-4">{{ user.email || '—' }}</td><td class="px-5 py-4"><span class="rounded-full bg-mist px-2.5 py-1 text-xs font-semibold">{{ user.role }}</span></td>
            <td class="px-5 py-4"><span :class="['rounded-full px-2.5 py-1 text-xs font-semibold', user.is_active ? 'bg-mint text-teal' : 'bg-slate-100 text-slate-500']">{{ user.is_active ? 'ใช้งานอยู่' : 'ปิดใช้งาน' }}</span></td>
            <td class="px-5 py-4 text-right"><button class="mr-2 rounded-lg p-2 hover:bg-mint" @click="openEdit(user)">✎</button><button v-if="isAdmin" class="rounded-lg p-2 hover:bg-orange-50" @click="remove(user)">⌫</button></td>
          </tr>
        </tbody>
      </table></div>
    </section>
    <div v-if="modal" class="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6" @click.self="modal = false">
      <form class="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" @submit.prevent="save">
        <div class="mb-6 flex justify-between"><div><p class="text-xs font-bold uppercase tracking-[.18em] text-teal">{{ isEdit ? 'Edit user' : 'New user' }}</p><h2 class="mt-1 text-xl font-bold">{{ isAdmin ? (isEdit ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งาน') : 'เปลี่ยนรหัสผ่าน' }}</h2></div><button type="button" @click="modal = false">✕</button></div>
        <div v-if="errorMessage" class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</div>
        <div class="space-y-4">
          <template v-if="isAdmin">
            <label class="block"><span class="label">Username *</span><input v-model="form.username" class="field" required /></label>
            <label class="block"><span class="label">ชื่อผู้ใช้งาน *</span><input v-model="form.full_name" class="field" required /></label>
            <label class="block"><span class="label">Email</span><input v-model="form.email" class="field" type="email" /></label>
            <div class="grid gap-4 sm:grid-cols-2"><label><span class="label">Role</span><select v-model="form.role" class="field"><option value="user">User</option><option value="admin">Admin</option></select></label><label><span class="label">สถานะ</span><select v-model="form.is_active" class="field"><option :value="true">ใช้งานอยู่</option><option :value="false">ปิดใช้งาน</option></select></label></div>
          </template>
          <div v-else class="rounded-xl bg-paper p-4"><p class="font-semibold">{{ form.full_name }}</p><p class="text-xs text-slate-500">{{ form.username }}</p></div>
          <label class="block"><span class="label">รหัสผ่าน {{ isAdmin && isEdit ? '(เว้นว่างถ้าไม่เปลี่ยน)' : '*' }}</span><input v-model="form.password" class="field" type="password" :required="!isAdmin || !isEdit" /></label>
          <label class="block"><span class="label">ยืนยันรหัสผ่าน</span><input v-model="confirmation" class="field" type="password" :required="!isAdmin || !isEdit || Boolean(form.password)" /></label>
        </div>
        <div class="mt-7 flex justify-end gap-3 border-t border-mist pt-5"><button type="button" class="btn-secondary" @click="modal = false">ยกเลิก</button><button class="btn-primary">บันทึกข้อมูล</button></div>
      </form>
    </div>
  </div>
</template>
