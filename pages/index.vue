<script lang="ts" setup>
useSeoMeta({
  title: 'TaskLancer',
  ogTitle: 'TaskLancer',
  description: 'Under construction.'
})
</script>

<template>
  <div class="grid gap-6">
    <section>
      <div class="mb-3">
        <h2>Time Worked</h2>
        <p class="text-stone-600">Track your hours worked.</p>
      </div>
      <WorkTimer />
    </section>
    <section>
      <div class="mb-3">
        <h2>Invoice Generation</h2>
        <p class="text-stone-600">Generate invoices for your clients.</p>
      </div>
      <InvoiceGenerator />
    </section>
  </div>
</template>
