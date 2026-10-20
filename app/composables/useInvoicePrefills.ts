import { currencies } from '~/utils/currency'
import { prefillFields, readPrefills, writePrefill, writePrefills } from '~/utils/prefills'

type Item = { description: string; amount: string }

export function useInvoicePrefills(
  fields: Record<(typeof prefillFields)[number], Ref<string | undefined>>,
  items: Ref<Item[]>,
) {
  const savedPrefills = ref<Record<string, string>>({})
  const ready = ref(false)

  onMounted(() => {
    try {
      savedPrefills.value = readPrefills(localStorage)
      for (const key of prefillFields) {
        const value = savedPrefills.value[key]
        if (value === undefined) continue
        if (key === 'currency' && !currencies.some(([code]) => code === value)) continue
        if (key === 'date' && value !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) continue
        fields[key].value = value
      }
      for (const [key, value] of Object.entries(savedPrefills.value)) {
        const match = /^items\.(\d+)\.(description|amount)$/.exec(key)
        if (!match) continue
        const index = Number(match[1])
        while (items.value.length <= index) items.value.push({ description: '', amount: '' })
        items.value[index]![match[2] as keyof Item] = value
      }
    } catch {
      toast.error('Saved prefills could not be loaded. Browser storage may be unavailable.')
    } finally {
      ready.value = true
    }
  })

  const savePrefill = (key: string, value: string | undefined) => {
    try {
      savedPrefills.value = writePrefill(localStorage, key, value ?? '')
      toast.success('Prefill saved for this browser.')
    } catch {
      toast.error('Could not save the prefill. Browser storage may be full or unavailable.')
    }
  }
  const forgetPrefill = (key: string) => {
    try {
      savedPrefills.value = writePrefill(localStorage, key, undefined)
      toast.success('Saved prefill removed. The current field is unchanged.')
    } catch {
      toast.error('Could not remove the saved prefill.')
    }
  }

  const saveItemPrefill = (index: number, item: Item) => {
    try {
      savedPrefills.value = writePrefills(localStorage, {
        [`items.${index}.description`]: item.description,
        [`items.${index}.amount`]: item.amount,
      })
      toast.success('Item prefill saved for this browser.')
    } catch {
      toast.error('Could not save the item prefill. Browser storage may be full or unavailable.')
    }
  }
  const forgetItemPrefill = (index: number) => {
    try {
      savedPrefills.value = writePrefills(localStorage, {
        [`items.${index}.description`]: undefined,
        [`items.${index}.amount`]: undefined,
      })
      toast.success('Saved item prefill removed. The current item is unchanged.')
    } catch {
      toast.error('Could not remove the saved item prefill.')
    }
  }

  return {
    savedPrefills,
    ready,
    savePrefill,
    forgetPrefill,
    saveItemPrefill,
    forgetItemPrefill,
  }
}
