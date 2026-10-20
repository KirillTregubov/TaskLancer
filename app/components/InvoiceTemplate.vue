<script lang="ts" setup>
import { formatMoney, invoiceTotals, currencyDigits, toMinorUnits } from '~/utils/currency'

const props = defineProps<{
  invoiceNumber?: string
  date: string
  companyName: string
  contactName: string
  address: string
  phone: string
  email: string
  billToField: string
  invoiceContents: Array<{ description: string; amount: string | number }>
  currency: string
  amountPaid: string | number
}>()

const totals = computed(() => {
  try {
    return invoiceTotals(
      props.invoiceContents.map((item) => item.amount),
      props.amountPaid,
      props.currency,
    )
  } catch {
    return null
  }
})
const money = (units: number) => formatMoney(units, props.currency)
const lineAmount = (amount: string | number) => {
  try {
    return money(toMinorUnits(amount, currencyDigits(props.currency)))
      .replace(props.currency, '')
      .replace(/[\s,]/g, '')
  } catch {
    return 'Invalid amount'
  }
}
const formattedDate = computed(() => {
  if (!props.date) return ''
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${props.date}T00:00:00Z`))
})
const formattedPhone = computed(() => {
  const digits = props.phone.replace(/\D/g, '')
  return digits.length === 10
    ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    : props.phone
})
const contactDetails = computed(() =>
  [props.contactName, formattedPhone.value, props.email].filter(Boolean).join(', '),
)

const printInvoice = async () => {
  await nextTick()
  const title = document.title
  try {
    document.title = props.invoiceNumber ? `Invoice ${props.invoiceNumber}` : 'Invoice'
    window.print()
  } finally {
    document.title = title
  }
}
defineExpose({ printInvoice })
</script>

<template>
  <button
    type="submit"
    class="cursor-pointer rounded-md bg-stone-800 px-6 py-2 font-semibold text-stone-100 shadow-xs ring-stone-500 transition outline-none hover:bg-stone-700 focus-visible:ring-2 active:bg-stone-700"
  >
    Print Invoice
  </button>
  <ClientOnly>
    <Teleport to="body">
      <article class="tasklancer-invoice" aria-label="Invoice">
        <header class="invoice-header">
          <div class="invoice-sender">
            <h1>{{ companyName || contactName }}</h1>
            <div class="multiline">{{ address }}</div>
            <div v-if="formattedPhone">{{ formattedPhone }}</div>
            <div v-if="email">{{ email }}</div>
          </div>
          <div class="invoice-meta">
            <h2>INVOICE</h2>
            <table class="invoice-details">
              <thead>
                <tr>
                  <th scope="col">INVOICE #</th>
                  <th scope="col">DATE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ invoiceNumber }}</td>
                  <td>{{ formattedDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </header>
        <section class="invoice-recipient">
          <h3>BILL TO</h3>
          <div class="multiline">{{ billToField }}</div>
        </section>
        <table class="invoice-items">
          <colgroup>
            <col style="width: 60%" />
            <col style="width: 10%" />
            <col style="width: 30%" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" colspan="2">DESCRIPTION</th>
              <th scope="col">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in invoiceContents" :key="index">
              <td colspan="2" class="multiline">{{ item.description }}</td>
              <td class="money">{{ lineAmount(item.amount) }}</td>
            </tr>
            <tr class="invoice-spacer" aria-hidden="true">
              <td colspan="2" />
              <td />
            </tr>
          </tbody>
          <tfoot v-if="totals">
            <tr>
              <td rowspan="4" class="invoice-thanks">Thank you for your business!</td>
              <td colspan="2" class="invoice-total">
                <div>
                  <span>Subtotal</span><span>{{ money(totals.total) }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="2" class="invoice-total invoice-grand-total">
                <div>
                  <span>Total</span><span>{{ money(totals.total) }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="2" class="invoice-total">
                <div>
                  <span>Amount Paid</span><span>{{ money(totals.amountPaid) }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="2" class="invoice-total">
                <div>
                  <span>{{ totals.balance < 0 ? 'Credit Balance' : 'Balance Due' }}</span
                  ><span>{{ money(Math.abs(totals.balance)) }}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
        <footer class="invoice-footer">
          <p>If you have any questions about this invoice, please do not hesitate to contact</p>
          <p v-if="contactDetails">{{ contactDetails }}</p>
        </footer>
      </article>
    </Teleport>
  </ClientOnly>
</template>

<style>
.tasklancer-invoice {
  display: none;
}
@media print {
  @page {
    size: auto;
    margin: 0;
  }
  body > :not(.tasklancer-invoice) {
    display: none !important;
  }
  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }
  .tasklancer-invoice {
    display: block !important;
    box-sizing: border-box;
    padding: 0.75in 0.7in;
    color: #000;
    font:
      11pt/1.5 Helvetica,
      Arial,
      sans-serif;
    overflow-wrap: anywhere;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .tasklancer-invoice h1 {
    margin: 0 0 4pt;
    font-size: 12pt;
    line-height: 1.5;
    font-weight: bold;
  }
  .tasklancer-invoice h2 {
    margin: 0 0 14pt;
    color: gray;
    font-size: 26pt;
    line-height: 1.1;
    font-weight: bold;
  }
  .invoice-header {
    display: grid;
    grid-template-columns: 45% 45%;
    justify-content: space-between;
    min-height: 1.34in;
    margin-bottom: 0.66in;
    break-inside: avoid;
  }
  .invoice-meta {
    text-align: right;
  }
  .invoice-details {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .invoice-details th,
  .invoice-details td {
    border: 0.5pt solid #000;
    text-align: center;
    padding: 0 3pt;
  }
  .invoice-details th {
    background: lightgray;
    font-weight: bold;
  }
  .invoice-recipient {
    min-height: 1.85in;
    break-inside: avoid;
  }
  .invoice-recipient h3 {
    width: 45%;
    box-sizing: border-box;
    margin: 0 0 4pt;
    padding: 1pt 5pt;
    border: 0.5pt solid #000;
    background: lightgray;
    font-size: inherit;
    font-weight: bold;
  }
  .multiline {
    white-space: pre-wrap;
  }
  .invoice-items {
    width: 100%;
    height: 4.5in;
    border: 0.5pt solid #000;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .invoice-items thead {
    display: table-header-group;
    background: lightgray;
  }
  .invoice-items th {
    border: 0.5pt solid #000;
    padding: 1pt 5pt;
    text-align: left;
    font-weight: bold;
  }
  .invoice-items th:last-child {
    text-align: center;
  }
  .invoice-items tbody td {
    border-right: 0.5pt solid #000;
    padding: 2pt 5pt;
    vertical-align: top;
  }
  .invoice-items .money {
    text-align: right;
    white-space: nowrap;
  }
  .invoice-items tr {
    break-inside: avoid;
  }
  .invoice-spacer {
    height: 100%;
  }
  .invoice-items tfoot {
    display: table-footer-group;
    break-inside: avoid;
  }
  .invoice-items tfoot tr {
    height: 0;
  }
  .invoice-items tfoot tr:first-child > td {
    border-top: 0.5pt solid #000;
  }
  .invoice-items .invoice-thanks {
    border-right: 0.5pt solid #000;
    padding: 14pt 8pt;
    vertical-align: middle;
    text-align: center;
    font-style: italic;
  }
  .invoice-total {
    padding: 0 5pt 0 10pt;
  }
  .invoice-total > div {
    display: flex;
    justify-content: space-between;
    gap: 6pt;
  }
  .invoice-total > div > span:last-child {
    white-space: nowrap;
  }
  .invoice-items tfoot tr:first-child .invoice-total {
    padding-top: 4pt;
  }
  .invoice-items tfoot tr:last-child .invoice-total {
    padding-bottom: 4pt;
  }
  .invoice-grand-total {
    font-weight: bold;
  }
  .invoice-footer {
    margin-top: 0.5in;
    text-align: center;
    break-inside: avoid;
  }
  .invoice-footer p {
    margin: 0;
  }
}
</style>
