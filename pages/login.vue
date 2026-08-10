<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const { signIn } = useAuth()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
async function login() {
  loading.value = true
  errorMessage.value = ''
  const result = await signIn('credentials', { username: username.value, password: password.value, redirect: false })
  if (result?.error) errorMessage.value = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
  else await navigateTo('/')
  loading.value = false
}
</script>

<template>
  <form class="w-full max-w-md" @submit.prevent="login">
    <div class="mb-9 lg:hidden"><div class="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-mint text-ink">฿</div><p class="text-xs font-bold uppercase tracking-[.2em] text-teal">AR CreditInvoice Dashboard</p></div>
    <p class="text-xs font-bold uppercase tracking-[.2em] text-teal">Welcome back</p>
    <h2 class="mt-2 text-3xl font-bold tracking-tight">เข้าสู่ระบบ</h2>
    <p class="mt-2 text-sm text-slate-500">เข้าสู่ workspace เพื่อตรวจสอบข้อมูล CreditInvoice</p>
    <div v-if="errorMessage" class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</div>
    <div class="mt-7 space-y-4">
      <label class="block"><span class="label">Username</span><input v-model="username" class="field" autocomplete="username" required /></label>
      <label class="block"><span class="label">Password</span><input v-model="password" class="field" type="password" autocomplete="current-password" required /></label>
    </div>
    <button class="btn-primary mt-6 w-full py-3" :disabled="loading">{{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}</button>
  </form>
</template>
