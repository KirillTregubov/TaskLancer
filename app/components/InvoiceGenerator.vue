<script lang="ts" setup>
import { ChevronDown } from 'lucide-vue-next'
import {
  currencies,
  currencyDigits,
  formatMoney,
  invoiceTotals
} from '~/utils/currency'

const generateInvoiceNumber = () => {
  const randomNumber = Math.floor(10000 + Math.random() * 90000)
  return `KRL${randomNumber}`
}

const invoiceNumber = ref<string | undefined>(undefined)
const date = ref('')
onMounted(() => {
  const today = new Date()
  date.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
})
const companyName = ref('')
const contactName = ref('')
const address = ref('')
const phone = ref('')
const email = ref('')
const billToField = ref('')
const invoiceContents = ref([{ description: '', amount: '' }])
const currency = ref('USD')
const amountPaid = ref('0')
const {
  savedPrefills,
  ready: prefillsReady,
  savePrefill,
  forgetPrefill,
  saveItemPrefill,
  forgetItemPrefill
} = useInvoicePrefills(
  {
    invoiceNumber,
    date,
    companyName,
    contactName,
    address,
    phone,
    email,
    billToField,
    currency,
    amountPaid
  },
  invoiceContents
)
const {
  recipients,
  ready: recipientsReady,
  isSaved: recipientIsSaved,
  saveRecipient,
  unsaveRecipient
} = useInvoiceRecipients(billToField)
const selectedRecipient = computed(() =>
  recipientIsSaved.value ? billToField.value.trim() : ''
)
const billToInput = useTemplateRef<HTMLTextAreaElement>('bill-to-input')
const selectRecipient = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  billToField.value = value
  if (!value) billToInput.value?.focus()
}
const invoiceTemplate = useTemplateRef('invoice-template')
const printError = ref('')
const digits = computed(() => currencyDigits(currency.value))
const amountStep = computed(() => 1 / 10 ** digits.value)

const addLineItem = () => {
  invoiceContents.value.push({ description: '', amount: '' })
}

const removeLineItem = (index: number) => {
  invoiceContents.value.splice(index, 1)
}

const regenerateInvoiceNumber = () => {
  invoiceNumber.value = generateInvoiceNumber()
}

const filteredInvoiceContents = computed(() => {
  return invoiceContents.value.filter(
    (item) => item.description.trim() || item.amount !== ''
  )
})

const summary = computed(() => {
  try {
    return {
      totals: invoiceTotals(
        filteredInvoiceContents.value.map((item) => item.amount),
        amountPaid.value,
        currency.value
      ),
      error: ''
    }
  } catch (error) {
    return { totals: null, error: (error as Error).message }
  }
})

const printInvoice = () => {
  printError.value = ''
  if (!filteredInvoiceContents.value.length) {
    printError.value = 'Add at least one invoice item before printing.'
    return
  }
  if (summary.value.error) {
    printError.value = summary.value.error
    return
  }
  invoiceTemplate.value?.printInvoice()
}
</script>

<template>
  <div class="max-w-xl rounded-md bg-stone-50 p-8">
    <p class="mb-4 text-sm text-stone-600">
      Save a field to prefill it next time in this browser. Unsaved edits apply
      only to this invoice.
    </p>
    <form class="space-y-4" @submit.prevent="printInvoice">
      <div>
        <label
          for="invoiceNumber"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Invoice Number:
        </label>
        <div class="flex min-w-0 items-stretch gap-2">
          <div class="min-w-0 flex-1">
            <div class="flex min-w-0 rounded-md shadow-xs">
              <input
                id="invoiceNumber"
                v-model="invoiceNumber"
                type="text"
                class="block w-full min-w-0 self-stretch rounded-l-md border-r-2 border-stone-400/80 bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
                placeholder="No Invoice Number"
              />
              <button
                type="button"
                class="shrink-0 rounded-r-sm bg-stone-300 px-3 py-2 font-semibold text-stone-600 shadow-xs ring-stone-500 transition outline-none hover:bg-stone-200 hover:text-stone-500 focus-visible:ring-2 active:bg-stone-200 active:text-stone-500"
                @click="regenerateInvoiceNumber"
              >
                Generate New
              </button>
            </div>
          </div>
          <SavePrefill
            :disabled="!prefillsReady"
            :label="'Invoice number'"
            :has-saved="savedPrefills['invoiceNumber'] !== undefined"
            :matches-saved="
              savedPrefills['invoiceNumber'] !== undefined &&
              savedPrefills['invoiceNumber'] === (invoiceNumber ?? '')
            "
            @save="savePrefill('invoiceNumber', invoiceNumber)"
            @forget="forgetPrefill('invoiceNumber')"
          />
        </div>
      </div>

      <div>
        <label
          for="date"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Invoice Date:
        </label>
        <div class="flex min-w-0 items-stretch gap-2">
          <div class="min-w-0 flex-1">
            <input
              id="date"
              v-model="date"
              type="date"
              required
              class="block w-full min-w-0 self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none placeholder:select-none"
            />
          </div>
          <SavePrefill
            :disabled="!prefillsReady"
            :label="'Invoice date'"
            :has-saved="savedPrefills['date'] !== undefined"
            :matches-saved="
              savedPrefills['date'] !== undefined &&
              savedPrefills['date'] === (date ?? '')
            "
            @save="savePrefill('date', date)"
            @forget="forgetPrefill('date')"
          />
        </div>
        <!-- TODO: Not working: selection:bg-stone-500 selection:text-stone-100 -->
      </div>

      <div>
        <label
          for="companyName"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Your Company Name:
        </label>
        <div class="flex min-w-0 items-stretch gap-2">
          <div class="min-w-0 flex-1">
            <input
              id="companyName"
              v-model="companyName"
              type="text"
              class="block w-full min-w-0 self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
              placeholder="Not provided"
            />
          </div>
          <SavePrefill
            :disabled="!prefillsReady"
            :label="'Company name'"
            :has-saved="savedPrefills['companyName'] !== undefined"
            :matches-saved="
              savedPrefills['companyName'] !== undefined &&
              savedPrefills['companyName'] === (companyName ?? '')
            "
            @save="savePrefill('companyName', companyName)"
            @forget="forgetPrefill('companyName')"
          />
        </div>
      </div>

      <div>
        <label
          for="contactName"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Your Name:
        </label>
        <div class="flex min-w-0 items-stretch gap-2">
          <div class="min-w-0 flex-1">
            <input
              id="contactName"
              v-model="contactName"
              type="text"
              class="block w-full min-w-0 self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
              placeholder="Not provided"
            />
          </div>
          <SavePrefill
            :disabled="!prefillsReady"
            :label="'Your name'"
            :has-saved="savedPrefills['contactName'] !== undefined"
            :matches-saved="
              savedPrefills['contactName'] !== undefined &&
              savedPrefills['contactName'] === (contactName ?? '')
            "
            @save="savePrefill('contactName', contactName)"
            @forget="forgetPrefill('contactName')"
          />
        </div>
      </div>

      <div>
        <label
          for="address"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Your Address:
        </label>
        <div class="flex min-w-0 items-stretch gap-2">
          <div class="min-w-0 flex-1">
            <textarea
              id="address"
              v-model="address"
              rows="3"
              class="block min-h-10 w-full min-w-0 self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
              placeholder="Not provided"
            />
          </div>
          <SavePrefill
            :disabled="!prefillsReady"
            :label="'Address'"
            :has-saved="savedPrefills['address'] !== undefined"
            :matches-saved="
              savedPrefills['address'] !== undefined &&
              savedPrefills['address'] === (address ?? '')
            "
            @save="savePrefill('address', address)"
            @forget="forgetPrefill('address')"
          />
        </div>
      </div>

      <div>
        <label
          for="phone"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Your Phone Number:
        </label>
        <div class="flex min-w-0 items-stretch gap-2">
          <div class="min-w-0 flex-1">
            <input
              id="phone"
              v-model="phone"
              type="tel"
              class="block w-full min-w-0 self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
              placeholder="Not provided"
            />
          </div>
          <SavePrefill
            :disabled="!prefillsReady"
            :label="'Phone number'"
            :has-saved="savedPrefills['phone'] !== undefined"
            :matches-saved="
              savedPrefills['phone'] !== undefined &&
              savedPrefills['phone'] === (phone ?? '')
            "
            @save="savePrefill('phone', phone)"
            @forget="forgetPrefill('phone')"
          />
        </div>
      </div>

      <div>
        <label
          for="email"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Your Email Address:
        </label>
        <div class="flex min-w-0 items-stretch gap-2">
          <div class="min-w-0 flex-1">
            <input
              id="email"
              v-model="email"
              type="email"
              class="block w-full min-w-0 self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
              placeholder="Not provided"
            />
          </div>
          <SavePrefill
            :disabled="!prefillsReady"
            :label="'Email address'"
            :has-saved="savedPrefills['email'] !== undefined"
            :matches-saved="
              savedPrefills['email'] !== undefined &&
              savedPrefills['email'] === (email ?? '')
            "
            @save="savePrefill('email', email)"
            @forget="forgetPrefill('email')"
          />
        </div>
      </div>

      <div>
        <label
          for="billToField"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Bill To:
        </label>
        <div class="flex min-w-0 items-stretch gap-2">
          <div class="min-w-0 flex-1">
            <textarea
              id="billToField"
              ref="bill-to-input"
              v-model="billToField"
              rows="3"
              class="block min-h-10 w-full min-w-0 self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
              placeholder="Not provided"
            />
          </div>
          <SavePrefill
            :disabled="!recipientsReady"
            label="recipient"
            :has-saved="recipientIsSaved"
            :matches-saved="recipientIsSaved"
            @save="saveRecipient"
            @forget="unsaveRecipient"
          />
        </div>
        <div class="mt-2">
          <label
            for="saved-recipient"
            class="mb-0.5 block text-sm font-medium text-stone-700"
          >
            Saved recipients:
          </label>
          <div class="relative">
            <select
              id="saved-recipient"
              :key="selectedRecipient"
              :value="selectedRecipient"
              :disabled="!recipientsReady"
              class="block min-h-10 w-full appearance-none rounded-md bg-stone-300 py-2 pr-10 pl-3 font-medium text-stone-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-stone-500 disabled:opacity-60"
              @change="selectRecipient"
            >
              <option value="">Create New Recipient</option>
              <option
                v-for="recipient in recipients"
                :key="recipient"
                :value="recipient"
              >
                {{
                  recipient
                    .split(/\r?\n/)
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, index) => (index === 1 ? `- ${line}` : line))
                    .join(' ')
                }}
              </option>
            </select>
            <ChevronDown
              aria-hidden="true"
              class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-stone-700"
            />
          </div>
        </div>
      </div>

      <div>
        <label class="mb-0.5 block text-sm font-medium text-stone-700">
          Invoice Items:
        </label>
        <div class="mb-2 space-y-2">
          <div
            v-for="(item, index) in invoiceContents"
            :key="index"
            class="grid gap-2 rounded-md border border-stone-200 p-2"
          >
            <div class="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_7rem]">
              <textarea
                v-model="item.description"
                :aria-label="`Item ${index + 1} description`"
                :required="item.amount !== ''"
                rows="2"
                class="block min-h-10 w-full min-w-0 rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 outline-none focus-visible:ring-2"
                placeholder="Description"
              />
              <input
                :value="item.amount"
                :aria-label="`Item ${index + 1} amount`"
                :step="amountStep"
                :required="!!item.description.trim()"
                type="number"
                placeholder="Amount"
                class="block min-h-10 w-full min-w-0 self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 outline-none focus-visible:ring-2"
                @input="item.amount = ($event.target as HTMLInputElement).value"
              />
            </div>
            <div class="flex items-stretch gap-2">
              <SavePrefill
                :disabled="!prefillsReady"
                :label="`Item ${index + 1}`"
                :has-saved="
                  savedPrefills[`items.${index}.description`] !== undefined ||
                  savedPrefills[`items.${index}.amount`] !== undefined
                "
                :matches-saved="
                  savedPrefills[`items.${index}.description`] ===
                    item.description &&
                  savedPrefills[`items.${index}.amount`] === item.amount
                "
                @save="saveItemPrefill(index, item)"
                @forget="forgetItemPrefill(index)"
              />
              <button
                type="button"
                class="min-h-10 rounded-md bg-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 outline-none hover:bg-stone-300 focus-visible:ring-2 focus-visible:ring-stone-500"
                :aria-label="`Remove item ${index + 1}`"
                @click="removeLineItem(index)"
              >
                Remove
              </button>
            </div>
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
          for="currency"
          class="mb-0.5 block text-sm font-medium text-stone-700"
          >Currency:</label
        >
        <div class="flex min-w-0 items-stretch gap-2">
          <div class="relative min-w-0 flex-1">
            <select
              id="currency"
              v-model="currency"
              class="block min-h-10 w-full appearance-none rounded-md bg-stone-300 py-2 pr-10 pl-3 font-medium text-stone-700"
            >
              <option
                v-for="[code, name] in currencies"
                :key="code"
                :value="code"
              >
                {{ code }} - {{ name }}
              </option>
            </select>
            <ChevronDown
              aria-hidden="true"
              class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-stone-700"
            />
          </div>
          <SavePrefill
            :disabled="!prefillsReady"
            :label="'Currency'"
            :has-saved="savedPrefills['currency'] !== undefined"
            :matches-saved="
              savedPrefills['currency'] !== undefined &&
              savedPrefills['currency'] === (currency ?? '')
            "
            @save="savePrefill('currency', currency)"
            @forget="forgetPrefill('currency')"
          />
        </div>
        <p class="mt-1 text-sm text-stone-600">
          Amounts are in {{ currency }} ({{ digits }} decimal places). Changing
          currency does not convert amounts.
        </p>
      </div>

      <div>
        <label
          for="amountPaid"
          class="mb-0.5 block text-sm font-medium text-stone-700"
        >
          Amount Paid:
        </label>
        <div class="flex min-w-0 items-stretch gap-2">
          <div class="min-w-0 flex-1">
            <input
              id="amountPaid"
              :value="amountPaid"
              min="0"
              :step="amountStep"
              type="number"
              class="block w-full min-w-0 self-stretch rounded-md bg-stone-300 px-3 py-2 font-medium text-stone-700 placeholder-stone-400 shadow-xs ring-stone-500 transition outline-none selection:bg-stone-500 selection:text-stone-100 placeholder:select-none"
              placeholder="Not provided"
              @input="amountPaid = ($event.target as HTMLInputElement).value"
            />
          </div>
          <SavePrefill
            :disabled="!prefillsReady"
            :label="'Amount paid'"
            :has-saved="savedPrefills['amountPaid'] !== undefined"
            :matches-saved="
              savedPrefills['amountPaid'] !== undefined &&
              savedPrefills['amountPaid'] === (amountPaid ?? '')
            "
            @save="savePrefill('amountPaid', amountPaid)"
            @forget="forgetPrefill('amountPaid')"
          />
        </div>
      </div>

      <div
        v-if="summary.totals"
        class="space-y-2 border-t border-stone-300 pt-4"
        aria-live="polite"
      >
        <div class="flex justify-between gap-4">
          <span>Total</span
          ><strong>{{ formatMoney(summary.totals.total, currency) }}</strong>
        </div>
        <div class="flex justify-between gap-4">
          <span>Amount paid</span
          ><span>{{ formatMoney(summary.totals.amountPaid, currency) }}</span>
        </div>
        <div class="flex justify-between gap-4">
          <span>{{
            summary.totals.balance < 0 ? 'Credit balance' : 'Balance due'
          }}</span
          ><strong>{{
            formatMoney(Math.abs(summary.totals.balance), currency)
          }}</strong>
        </div>
      </div>
      <p
        v-if="summary.error || printError"
        role="alert"
        class="text-sm text-red-700"
      >
        {{ summary.error || printError }}
      </p>

      <InvoiceTemplate
        ref="invoice-template"
        :invoice-number="invoiceNumber"
        :date="date"
        :company-name="companyName"
        :contact-name="contactName"
        :address="address"
        :phone="phone"
        :email="email"
        :bill-to-field="billToField"
        :invoice-contents="filteredInvoiceContents"
        :currency="currency"
        :amount-paid="amountPaid"
      />
    </form>
  </div>
</template>
