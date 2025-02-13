<script lang="ts" setup>
// import jsPDF from 'jspdf'

interface Props {
  invoiceNumber?: string
  date?: Date
  companyName?: string
  contactName?: string
  address?: string
  phone?: string
  email?: string
  billToField?: string
  invoiceContents?: Array<{ description: string; amount: number }>
  currencySymbol?: string
  amountPaid?: number
}

const {
  invoiceNumber = 'INV-0001',
  date = new Date('2023-01-01'),
  companyName = 'Company Name',
  contactName = 'John Doe',
  address = '123 Main St\nAnytown, USA',
  phone = '1234567890',
  email = 'john.doe@example.com',
  billToField = 'John Doe\nCompany Name\n123 Main St\nAnytown, USA\n(123) 456-7890\njohn.doe@example.com',
  invoiceContents = [
    { description: 'Service Fee', amount: 75 },
    { description: 'Labour', amount: 5 }
  ],
  currencySymbol = '$',
  amountPaid = 0
} = defineProps<Props>()

const formattedPhone = computed(() => {
  if (!phone) return null

  const digits = phone.replace(/\D/g, '') // Remove non-numeric characters
  if (digits.length !== 10) return phone // Return as-is if not 10 digits

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
})

const formattedDate = computed(() => {
  if (!date) return null

  const locale = navigator?.language || 'en-US'

  try {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Wrong date format', error)
    return null
  }
})

const formatAmount = (amount: string | number) => {
  if (typeof amount === 'number') {
    const num = amount.toFixed(2)

    if (amount < 0) {
      return `(${num})`
    } else {
      return num
    }
  }

  return amount
}

const total = computed(() => {
  return invoiceContents.reduce((acc, cur) => acc + cur.amount, 0)
})

const balanceDue = computed(() => {
  return total.value - amountPaid
})

const pdfContainer = useTemplateRef('pdf-container')

// const saveAsPDF = async () => {
//   if (!pdfContainer.value) return

//   const pdf = new jsPDF({
//     orientation: 'portrait',
//     unit: 'px',
//     // TODO: Letter, A4, A5 for now
//     format: 'A4',
//     putOnlyUsedFonts: true
//     // hotfixes: ['px_scaling']
//     // precision: 5
//     // unit: documentOptions?.unit ?? 'px',
//     // format: documentOptions?.format ?? 'A4',
//     // encryption: documentOptions?.encryption
//   })

//   const width = `${pdf.internal.pageSize.width}px`
//   pdfContainer.value.style.minWidth = width
//   pdfContainer.value.style.maxWidth = width
//   pdfContainer.value.style.minHeight = `${pdf.internal.pageSize.height}px`

//   // pdf.addFont('OpenSans-Regular', 'OpenSans Regular', 'normal')

//   // const width = pdfContainer.value.clientWidth
//   // console.log('width', width)

//   await pdf.html(pdfContainer.value, {
//     // windowWidth:
//     // width: pdf.internal.pageSize.width,
//     // windowWidth: pdf.internal.pageSize.width,
//     // width,
//     html2canvas: {
//       // scale: 0.8,
//       useCORS: true
//     }
//   })

//   // const expectedHeight = pdf.internal.pageSize.height
//   // const actualHeight = pdfContainer.value.clientHeight
//   // if (actualHeight > expectedHeight && actualHeight - expectedHeight < 1) {
//   pdf.deletePage(pdf.getNumberOfPages())
//   // }

//   await pdf.save('invoice.pdf')
// }

const saveAsPDF = () => {
  const element = pdfContainer.value
  if (!element) return

  // Open a new window
  const printWindow = window.open('', '') // , 'height=600,width=800'
  if (!printWindow) return

  // Write the content to the new window
  printWindow.document.write(
    '<html><head><title>Generated Invoice</title><style>@media print { @page { margin: 0; } } html { font-size: 24px; font-family: Helvetica !important; } table { font-size: unset; } th:not(.unset), td:not(.unset) { padding-top: 0.125rem; }</style>'
  )

  const tailwindScript = printWindow.document.createElement('script')
  tailwindScript.src = 'https://unpkg.com/@tailwindcss/browser@4'
  printWindow.document.head.appendChild(tailwindScript)

  printWindow.document.write('</head><body>')
  printWindow.document.write(element.innerHTML)
  printWindow.document.write('</body></html>')

  // Close the document to ensure all resources are loaded
  printWindow.document.close()

  printWindow.addEventListener('load', () => {
    printWindow.print()
    printWindow.close()
  })
}
</script>

<template>
  <div>
    <button
      class="cursor-pointer rounded-sm bg-stone-800 px-6 py-2 font-semibold text-stone-100 ring-stone-500 transition outline-none hover:bg-stone-700 focus-visible:ring-2 active:bg-stone-700"
      @click="saveAsPDF"
    >
      Print Invoice
    </button>
    <div class="hidden max-w-7xl bg-white">
      <div id="pdf-container" ref="pdf-container">
        <div class="h-full p-[1in]">
          <div class="grid h-full w-full grid-cols-2 gap-x-16 gap-y-8">
            <div>
              <h1 class="mb-1 text-lg font-semibold">{{ companyName }}</h1>
              <h2 v-if="address" class="whitespace-pre-wrap">
                {{ address }}
              </h2>
              <h2 v-if="formattedPhone">
                {{ formattedPhone }}
              </h2>
              <h2 v-if="email">
                {{ email }}
              </h2>
            </div>
            <div class="justify-self-end text-right">
              <!-- TODO: Custom Themes -->
              <div class="mb-6 block text-4xl font-bold text-[gray]">
                INVOICE
              </div>
              <table
                class="w-full table-fixed border-collapse border border-black"
              >
                <tbody>
                  <tr class="bg-[lightGray] uppercase">
                    <th
                      class="border border-black text-center leading-6 font-bold"
                    >
                      INVOICE #
                    </th>
                    <th
                      class="border border-black text-center leading-6 font-bold"
                    >
                      Date
                    </th>
                  </tr>
                  <tr>
                    <td class="border border-black text-center leading-6">
                      {{ invoiceNumber }}
                    </td>
                    <td class="border border-black text-center leading-6">
                      {{ formattedDate }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <table
                class="mb-1 block border border-black bg-[lightGray] px-2 leading-7 font-bold"
              >
                <tbody>
                  <tr>
                    <th>BILL TO</th>
                  </tr>
                </tbody>
              </table>
              <div class="">
                <h2 class="whitespace-pre-wrap">
                  {{ billToField }}
                </h2>
              </div>
            </div>

            <table
              class="col-span-2 min-h-96 w-full table-fixed border-collapse border border-black"
            >
              <colgroup>
                <col />
                <col style="width: 10%" />
                <col style="width: 30%" />
              </colgroup>
              <thead class="bg-[lightGray] uppercase">
                <tr>
                  <th
                    class="border border-black px-2 text-left leading-7 font-bold"
                    colspan="2"
                  >
                    DESCRIPTION
                  </th>
                  <th
                    class="border border-black text-center leading-7 font-bold"
                  >
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody class="border border-black">
                <tr
                  v-for="content in invoiceContents"
                  :key="content.description"
                  class="*:py-0.5 first:*:pt-2 last:*:pb-2"
                >
                  <td
                    class="unset border-r border-black px-2 text-left whitespace-pre-wrap"
                    colspan="2"
                  >
                    {{ content.description }}
                  </td>
                  <td class="unset px-2 text-right align-top">
                    {{ formatAmount(content.amount) }}
                  </td>
                </tr>
                <tr class="h-full" aria-hidden="true">
                  <td class="border-r border-black" colspan="2" />
                  <td />
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th
                    scope="row"
                    class="unset border-r border-black p-2 text-center font-normal italic"
                    rowspan="4"
                  >
                    Thank you for your business!
                  </th>
                  <td class="unset px-2 py-0.5 pt-2 pl-4 text-left" colspan="2">
                    <div class="flex w-full items-center">
                      <span class="mr-auto">Subtotal</span>
                      <span class="text-right">
                        {{ currencySymbol }}
                        {{ formatAmount(total) }}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="unset px-2 py-0.5 pl-4 text-left" colspan="2">
                    <div class="flex w-full items-center">
                      <span class="mr-auto font-bold">Total</span>
                      <span class="text-right">
                        {{ currencySymbol }}
                        {{ formatAmount(total) }}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    class="unset px-2 py-0.5 pl-4 text-left whitespace-nowrap"
                    colspan="2"
                  >
                    <div class="flex w-full items-center">
                      <span class="mr-auto">Amount Paid</span>
                      <span class="text-right">
                        {{ currencySymbol }} {{ formatAmount(amountPaid) }}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    class="unset px-2 py-0.5 pb-2 pl-4 text-left whitespace-nowrap"
                    colspan="2"
                  >
                    <div class="flex w-full items-center">
                      <span class="mr-auto">Balance Due</span>
                      <span class="text-right">
                        {{ currencySymbol }} {{ formatAmount(balanceDue) }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>

            <div
              class="col-span-2 flex h-full flex-col justify-center text-center"
            >
              <div>
                If you have any questions about this invoice, please do not
                hesitate to contact
              </div>
              <div>{{ contactName }}, {{ formattedPhone }}, {{ email }}</div>
            </div>

            <!-- <div class="col-span-2 text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              ligula lectus, commodo a urna in, porttitor suscipit risus.
              Curabitur vitae velit odio. Mauris quis eros quis mauris
              condimentum viverra. Fusce id lectus sit amet ante dictum porta.
              Nunc tincidunt aliquam nibh, ut condimentum ex placerat elementum.
              Mauris egestas imperdiet magna quis faucibus. Aenean ac justo at
              dui gravida venenatis. Suspendisse euismod, sem quis elementum
              condimentum, neque erat commodo leo, eu semper turpis orci sit
              amet ante. Nulla euismod varius massa, sit amet volutpat nisl
              dictum varius. Phasellus at augue at ligula posuere malesuada.
              <br />
              <br />
              Integer sodales porttitor sollicitudin. Suspendisse vehicula
              finibus dictum. Quisque aliquet vestibulum metus, sed elementum
              sapien dictum ac. Orci varius natoque penatibus et magnis dis
              parturient montes, nascetur ridiculus mus. Sed at ante faucibus,
              faucibus mauris eu, aliquet purus. Praesent tortor lorem, aliquet
              mattis ex sit amet, molestie aliquam enim. Morbi velit ex,
              suscipit ultricies justo id, pharetra aliquam purus. Ut maximus
              varius interdum. Nam sed nunc a nunc venenatis iaculis. Aenean
              tincidunt, elit a porta imperdiet, erat mi tincidunt nunc, eget
              interdum nisl ipsum in sapien. Vestibulum massa nulla, viverra in
              tortor sed, eleifend rhoncus libero. Suspendisse viverra aliquet
              feugiat.
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#pdf-container {
  /* TODO: Implement custom fonts https://www.devlinpeck.com/content/jspdf-custom-font */
  font-size: 24px;
  font-family: Helvetica !important;
  /* font-family: Courier; */
}
</style>
