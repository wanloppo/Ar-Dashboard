<script setup lang="ts">
defineEmits<{ openMenu: [] }>()
const { data, signOut } = useAuth()
const userName = computed(() => data.value?.user?.name || 'ผู้ใช้งาน')
const menuOpen = ref(false)
const today = computed(() => new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric'
}).format(new Date()))
</script>

<template>
  <header class="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-mist bg-paper/90 px-4 backdrop-blur sm:px-6 lg:px-10">
    <div class="flex items-center gap-3">
      <button class="rounded-lg p-2 hover:bg-mist lg:hidden" aria-label="เปิดเมนู" @click="$emit('openMenu')">☰</button>
      <div><p class="text-xs text-slate-500">{{ today }}</p><p class="text-sm font-semibold">สวัสดี, {{ userName }}</p></div>
    </div>
    <div class="relative flex items-center gap-3">
      <div class="hidden items-center gap-2 rounded-full border border-mist bg-white px-3 py-2 text-xs text-slate-500 sm:flex"><span class="h-2 w-2 rounded-full bg-teal" /> Connected to MSSQL</div>
      <button class="grid h-9 w-9 place-items-center rounded-full bg-mint text-sm font-bold text-teal" aria-label="เมนูผู้ใช้" @click="menuOpen = !menuOpen">{{ userName.slice(0, 1) }}</button>
      <div v-if="menuOpen" class="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-mist bg-white p-2 shadow-soft">
        <div class="border-b border-mist px-3 py-2"><p class="text-sm font-bold">{{ userName }}</p><p class="mt-0.5 text-xs text-slate-500">บัญชีผู้ใช้งาน</p></div>
        <NuxtLink to="/users" class="mt-1 flex rounded-xl px-3 py-2.5 text-sm hover:bg-mist" @click="menuOpen = false">จัดการผู้ใช้งาน</NuxtLink>
        <button class="flex w-full rounded-xl px-3 py-2.5 text-left text-sm text-coral hover:bg-orange-50" @click="signOut({ callbackUrl: '/login' })">ออกจากระบบ</button>
      </div>
    </div>
  </header>
</template>
