<template>
  <div class="min-h-screen bg-ink">
    <div class="grid min-h-screen lg:grid-cols-[1.1fr_.9fr]">
      <div class="hidden flex-col justify-between bg-teal p-10 text-white lg:flex">
        <div class="flex items-center gap-3">
          <div class="grid h-10 w-10 place-items-center rounded-xl bg-mint text-ink">฿</div>
          <span class="font-bold">AR CreditInvoice Dashboard</span>
        </div>
        <div>
          <p class="mb-4 text-xs font-bold uppercase tracking-[.22em] text-mint">Account receivable</p>
          <h1 class="max-w-lg text-5xl font-bold leading-[1.05]">CreditInvoice<br /><span class="text-mint">at a glance.</span></h1>
          <p class="mt-6 max-w-md text-sm leading-relaxed text-white/70">ติดตามยอด CreditInvoice และ BankInvoice พร้อมรายละเอียดรายวันใน workspace เดียว</p>
        </div>
        <p class="text-xs text-white/40">Secure workspace · MSSQL connected</p>
      </div>
      <div class="flex items-center justify-center bg-paper p-5 sm:p-10"><slot /></div>
    </div>
  </div>
</template>
