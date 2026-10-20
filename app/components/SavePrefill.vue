<script setup lang="ts">
const props = defineProps<{
  label: string
  disabled?: boolean
  hasSaved: boolean
  matchesSaved: boolean
}>()
defineEmits<{ save: []; forget: [] }>()

const isSaved = computed(() => props.hasSaved && props.matchesSaved)
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :aria-label="`${isSaved ? 'Unsave' : 'Save'} ${label} prefill`"
    :aria-pressed="isSaved"
    class="min-h-10 shrink-0 self-stretch rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-stone-500"
    :class="
      isSaved
        ? 'bg-stone-700 text-stone-100 hover:bg-stone-800'
        : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
    "
    @click="isSaved ? $emit('forget') : $emit('save')"
  >
    {{ isSaved ? 'Unsave' : 'Save' }}
  </button>
</template>
