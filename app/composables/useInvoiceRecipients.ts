import { readPrefills, writePrefill } from '~/utils/prefills'
import { RECIPIENTS_KEY, readRecipients, writeRecipient } from '~/utils/recipients'

export function useInvoiceRecipients(field: Ref<string>) {
  const recipients = ref<string[]>([])
  const ready = ref(false)
  const isSaved = computed(() => recipients.value.includes(field.value.trim()))

  onMounted(() => {
    try {
      recipients.value = readRecipients(localStorage)
      // Preserve the existing Bill To prefill as the first saved recipient.
      if (localStorage.getItem(RECIPIENTS_KEY) === null) {
        localStorage.setItem(RECIPIENTS_KEY, JSON.stringify(recipients.value))
      }
      if (readPrefills(localStorage).billToField !== undefined) {
        writePrefill(localStorage, 'billToField', undefined)
      }
    } catch {
      toast.error('Saved recipients could not be loaded. Browser storage may be unavailable.')
    } finally {
      ready.value = true
    }
  })

  const saveRecipient = () => {
    if (!field.value.trim()) {
      toast.error('Enter a recipient before saving.')
      return
    }
    try {
      recipients.value = writeRecipient(localStorage, field.value, true)
      toast.success('Recipient saved for this browser.')
    } catch {
      toast.error('Could not save the recipient. Browser storage may be full or unavailable.')
    }
  }
  const unsaveRecipient = () => {
    try {
      recipients.value = writeRecipient(localStorage, field.value, false)
      toast.success('Recipient removed from saved recipients.')
    } catch {
      toast.error('Could not remove the saved recipient.')
    }
  }

  return { recipients, ready, isSaved, saveRecipient, unsaveRecipient }
}
