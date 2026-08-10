<script setup lang="ts">
const sidebarOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-paper">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="lg:pl-[264px]">
      <AppTopbar @open-menu="sidebarOpen = true" />
      <main class="mx-auto max-w-[1600px] px-4 pb-10 pt-5 sm:px-6 lg:px-10 lg:pt-8">
        <slot />
      </main>
    </div>
  </div>
</template>
