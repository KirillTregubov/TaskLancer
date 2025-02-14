<script lang="ts" setup>
import { MinusIcon } from 'lucide-vue-next'

const generateInvoiceNumber = () => {
  const randomNumber = Math.floor(10000 + Math.random() * 90000)
  return `KRL${randomNumber}`
}

const invoiceNumber = ref<string | undefined>(undefined)
const date = ref(new Date().toISOString().split('T')[0])
const companyName = ref('')
const contactName = ref('')
const address = ref('')
const phone = ref('')
const email = ref('')
const billToField = ref('')
const invoiceContents = ref([
  { description: '', amount: undefined as number | undefined }
])
const currencySymbol = ref('$')
const amountPaid = ref(0)

const addLineItem = () => {
  invoiceContents.value.push({ description: '', amount: undefined })
}

const removeLineItem = (index: number) => {
  invoiceContents.value.splice(index, 1)
}

const regenerateInvoiceNumber = () => {
  invoiceNumber.value = generateInvoiceNumber()
}

const resetCurrencySymbol = () => {
  currencySymbol.value = '$'
}

const filteredInvoiceContents = computed(() => {
  return invoiceContents.value.filter((item) => item.amount !== undefined) as {
    description: string
    amount: number
  }[]
})
</script>

<template>
  <div class="max-w-xl rounded-md bg-stone-50 p-8">
    <form class="space-y-4" @submit.prevent>
      <div>
        <label
          for="invoiceNumber"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Invoice Number:
        </label>
        <div class="flex rounded-md shadow-xs">
          <input
            id="invoiceNumber"
            v-model="invoiceNumber"
            type="text"
            readonly
            tabindex="-1"
            class="w-full self-stretch rounded-l-md border-r-2 border-stone-400/80 bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
            placeholder="No Invoice Number"
          />
          <button
            type="button"
            class="shrink-0 rounded-r-sm bg-stone-300 px-6 py-2 font-semibold text-stone-600 shadow-xs ring-stone-500 transition outline-none hover:bg-stone-200 hover:text-stone-500 focus-visible:ring-2 active:bg-stone-200 active:text-stone-500"
            @click="regenerateInvoiceNumber"
          >
            Generate New
          </button>
        </div>
      </div>

      <div>
        <label
          for="date"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Invoice Date:
        </label>
        <input
          id="date"
          v-model="date"
          type="date"
          class="w-full self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none placeholder:select-none"
        />
        <!-- TODO: Not working: selection:bg-stone-500 selection:text-stone-100 -->
      </div>

      <div>
        <label
          for="companyName"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Your Company Name:
        </label>
        <input
          id="companyName"
          v-model="companyName"
          type="text"
          class="w-full self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
          placeholder="Not provided"
        />
      </div>

      <div>
        <label
          for="contactName"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Your Name:
        </label>
        <input
          id="contactName"
          v-model="contactName"
          type="text"
          class="w-full self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
          placeholder="Not provided"
        />
      </div>

      <div>
        <label
          for="address"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Your Address:
        </label>
        <textarea
          id="address"
          v-model="address"
          rows="3"
          class="-mb-2 min-h-10 w-full self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
          placeholder="Not provided"
        />
      </div>

      <div>
        <label
          for="phone"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Your Phone Number:
        </label>
        <input
          id="phone"
          v-model="phone"
          type="tel"
          class="w-full self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
          placeholder="Not provided"
        />
      </div>

      <div>
        <label
          for="email"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Your Email Address:
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="w-full self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
          placeholder="Not provided"
        />
      </div>

      <div>
        <label
          for="billToField"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Bill To:
        </label>
        <textarea
          id="billToField"
          v-model="billToField"
          rows="3"
          class="-mb-2 min-h-10 w-full self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
          placeholder="Not provided"
        />
      </div>

      <div>
        <label class="mb-0.5 block text-sm font-medium text-stone-700">
          Invoice Items:
        </label>
        <div class="mb-2 space-y-2">
          <div
            v-for="(item, index) in invoiceContents"
            :key="index"
            class="flex items-start space-x-2"
          >
            <textarea
              v-model="item.description"
              rows="2"
              class="min-h-10 w-full self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
              placeholder="Description"
            />
            <input
              v-model.number="item.amount"
              type="number"
              placeholder="Amount"
              class="w-full max-w-44 rounded-md bg-stone-300 px-3 py-2.5 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
            />
            <button
              type="button"
              class="w-fit rounded-md bg-stone-300 p-2.5 text-lg font-semibold text-stone-600 shadow-xs ring-stone-500 transition outline-none hover:bg-stone-200 hover:text-stone-500 focus-visible:ring-2 active:bg-stone-200 active:text-stone-500"
              @click="removeLineItem(index)"
            >
              <MinusIcon />
            </button>
          </div>
        </div>
        <button
          type="button"
          class="rounded-md bg-stone-300 px-6 py-2 text-lg font-semibold text-stone-600 shadow-xs ring-stone-500 transition outline-none hover:bg-stone-200 hover:text-stone-500 focus-visible:ring-2 active:bg-stone-200 active:text-stone-500"
          @click="addLineItem"
        >
          Add Item
        </button>
      </div>

      <div>
        <label
          for="currencySymbol"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Currency Symbol:
        </label>
        <div class="flex rounded-md shadow-xs">
          <input
            id="currencySymbol"
            v-model="currencySymbol"
            type="text"
            class="z-10 w-full self-stretch rounded-l-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none focus-visible:ring-2"
          />
          <div class="w-0.5 shrink-0 bg-stone-400/80" />
          <button
            type="button"
            class="z-10 shrink-0 rounded-r-sm bg-stone-300 px-6 py-2 font-semibold text-stone-600 shadow-xs ring-stone-500 transition outline-none hover:bg-stone-200 hover:text-stone-500 focus-visible:ring-2 active:bg-stone-200 active:text-stone-500"
            @click="resetCurrencySymbol"
          >
            Reset to Default
          </button>
        </div>
      </div>

      <div>
        <label
          for="amountPaid"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Amount Paid:
        </label>
        <input
          id="amountPaid"
          v-model.number="amountPaid"
          type="number"
          class="w-full self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
          placeholder="Not provided"
        />
      </div>

      <InvoiceTemplate
        :invoice-number="invoiceNumber"
        :date="new Date(date)"
        :company-name="companyName"
        :contact-name="contactName"
        :address="address"
        :phone="phone"
        :email="email"
        :bill-to-field="billToField"
        :invoice-contents="filteredInvoiceContents"
        :currency-symbol="currencySymbol"
        :amount-paid="amountPaid"
      />
    </form>
  </div>
</template>
