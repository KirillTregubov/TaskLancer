export const PREFILLS_KEY = 'tasklancer.invoice-prefills.v1'
export const prefillFields = [
  'invoiceNumber',
  'date',
  'companyName',
  'contactName',
  'address',
  'phone',
  'email',
  'billToField',
  'currency',
  'amountPaid',
] as const

export function isPrefillKey(key: string): boolean {
  return (
    (prefillFields as readonly string[]).includes(key) ||
    /^items\.(?:0|[1-9]\d{0,2})\.(?:description|amount)$/.test(key)
  )
}

export function readPrefills(storage: Pick<Storage, 'getItem'>): Record<string, string> {
  const raw = storage.getItem(PREFILLS_KEY)
  if (!raw) return {}
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  return Object.fromEntries(
    Object.entries(parsed).filter(([key, value]) => isPrefillKey(key) && typeof value === 'string'),
  )
}

export function writePrefills(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  updates: Record<string, string | undefined>,
): Record<string, string> {
  if (Object.keys(updates).some((key) => !isPrefillKey(key)))
    throw new Error('Unknown prefill field')
  const updated = { ...readPrefills(storage) }
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) updated[key] = value
  }
  const saved = Object.fromEntries(
    Object.entries(updated).filter(([key]) => !(key in updates) || updates[key] !== undefined),
  )
  storage.setItem(PREFILLS_KEY, JSON.stringify(saved))
  return saved
}

export function writePrefill(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  key: string,
  value: string | undefined,
): Record<string, string> {
  return writePrefills(storage, { [key]: value })
}
