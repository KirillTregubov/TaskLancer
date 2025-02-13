<script lang="ts" setup>
// const printPage = () => {
//   window.print()
// }
const generateInvoiceNumber = () => {
  const randomNumber = Math.floor(10000 + Math.random() * 90000) // Generates a random 5-digit number
  return `KRL${randomNumber}`
}
</script>

<template>
  <div>
    <!-- <button @click="printPage">Print Page</button> -->
    <InvoiceTemplate
      :invoice-number="generateInvoiceNumber()"
      :date="new Date()"
    />
  </div>
</template>
