<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()
const route = useRoute()
const { data } = useAuth()
const isAdmin = computed(() => ((data.value?.user || {}) as { role?: string }).role === 'admin')
const { can, loadPermissions } = usePermissions()
const workspace = [
  { label: 'ภาพรวม CreditInvoice', to: '/', icon: '▦', screen: 'creditinvoice_dashboard' },
  { label: 'รายละเอียดรายวัน', to: '/daily', icon: '▤', screen: 'creditinvoice_daily' }
]
const active = (to: string) => to === '/' ? route.path === '/' : route.path.startsWith(to)
onMounted(() => { void loadPermissions() })
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-30 bg-ink/30 lg:hidden" @click="$emit('close')" />
  <aside :class="['fixed inset-y-0 left-0 z-40 flex w-[264px] -translate-x-full flex-col bg-ink px-4 py-5 text-white transition-transform lg:translate-x-0', open ? 'translate-x-0' : '']">
    <div class="flex items-center gap-3 px-3 pb-8">
      <div class="grid h-10 w-10 place-items-center rounded-xl bg-mint font-bold text-ink">฿</div>
      <div><p class="text-[15px] font-bold">AR Dashboard</p><p class="text-[11px] text-slate-400">CreditInvoice operations</p></div>
    </div>
    <nav class="flex-1 space-y-7 overflow-y-auto">
      <div>
        <p class="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Workspace</p>
        <NuxtLink v-for="item in workspace.filter(i => can(i.screen, 'query'))" :key="item.to" :to="item.to" :class="['mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition', active(item.to) ? 'bg-white text-ink shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white']" @click="$emit('close')"><span class="w-5 text-center">{{ item.icon }}</span>{{ item.label }}</NuxtLink>
      </div>
      <div>
        <p class="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Administration</p>
        <NuxtLink to="/users" :class="['flex items-center gap-3 rounded-xl px-3 py-3 text-sm', active('/users') ? 'bg-white text-ink' : 'text-slate-300 hover:bg-white/10']" @click="$emit('close')"><span class="w-5 text-center">♙</span>ผู้ใช้งานระบบ</NuxtLink>
      </div>
      <div v-if="isAdmin">
        <p class="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Security</p>
        <NuxtLink to="/screens" :class="['mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm', active('/screens') ? 'bg-white text-ink' : 'text-slate-300 hover:bg-white/10']" @click="$emit('close')"><span class="w-5 text-center">▣</span>หน้าจอระบบ</NuxtLink>
        <NuxtLink to="/access" :class="['flex items-center gap-3 rounded-xl px-3 py-3 text-sm', active('/access') ? 'bg-white text-ink' : 'text-slate-300 hover:bg-white/10']" @click="$emit('close')"><span class="w-5 text-center">⌘</span>กำหนดสิทธิ์ผู้ใช้</NuxtLink>
      </div>
    </nav>
    <div class="rounded-2xl border border-white/10 bg-white/5 p-3.5"><div class="mb-2 flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-mint" /><span class="text-xs font-semibold">ระบบพร้อมใช้งาน</span></div><p class="text-[11px] leading-relaxed text-slate-400">เชื่อมต่อฐานข้อมูล ARVL ผ่าน MSSQL</p></div>
    <div class="mt-4 border-t border-white/10 pt-4 text-[11px] text-slate-500">v1.0 · AR Operations</div>
  </aside>
</template>
