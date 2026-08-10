<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  label: string
  required?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const picker = ref<HTMLInputElement | null>(null)

function formatIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : ''
}

const display = ref(formatIso(props.modelValue))
watch(() => props.modelValue, value => { display.value = formatIso(value) })

function formatTyping(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function parseDisplay(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return null
  const [, day, month, year] = match
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  if (parsed.getUTCFullYear() !== Number(year) || parsed.getUTCMonth() !== Number(month) - 1 || parsed.getUTCDate() !== Number(day)) return null
  return `${year}-${month}-${day}`
}

function onInput(event: Event) {
  display.value = formatTyping((event.target as HTMLInputElement).value)
  const iso = parseDisplay(display.value)
  if (iso) emit('update:modelValue', iso)
}

function onBlur() {
  if (!parseDisplay(display.value)) display.value = formatIso(props.modelValue)
}

function chooseDate(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (value) {
    emit('update:modelValue', value)
    display.value = formatIso(value)
  }
}

function openPicker() {
  const input = picker.value
  if (!input) return
  if (typeof input.showPicker === 'function') input.showPicker()
  else input.click()
}
</script>

<template>
  <label class="block">
    <span class="label">{{ label }}</span>
    <span class="relative block">
      <input
        :value="display"
        class="field pr-11"
        type="text"
        inputmode="numeric"
        placeholder="dd/mm/yyyy"
        maxlength="10"
        :required="required"
        @input="onInput"
        @blur="onBlur"
      />
      <button type="button" class="absolute right-0 top-0 grid h-full w-11 place-items-center text-slate-500 transition hover:text-teal" aria-label="เลือกวันที่" @click="openPicker">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3.5 10h17" />
        </svg>
      </button>
      <input ref="picker" :value="modelValue" class="pointer-events-none absolute right-2 top-1/2 h-0 w-0 opacity-0" type="date" tabindex="-1" @change="chooseDate" />
    </span>
  </label>
</template>
