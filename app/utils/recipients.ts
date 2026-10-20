import { readPrefills } from './prefills'

export const RECIPIENTS_KEY = 'tasklancer.invoice-recipients.v1'

export function readRecipients(storage: Pick<Storage, 'getItem'>): string[] {
  const raw = storage.getItem(RECIPIENTS_KEY)
  if (raw === null) {
    const legacy = readPrefills(storage).billToField?.trim()
    return legacy ? [legacy] : []
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  return [
    ...new Set(
      parsed
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ]
}

export function writeRecipient(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  recipient: string,
  save: boolean,
): string[] {
  const value = recipient.trim()
  if (!value) throw new Error('Enter a recipient before saving.')
  const current = readRecipients(storage)
  const updated = save
    ? [...new Set([...current, value])]
    : current.filter((entry) => entry !== value)
  storage.setItem(RECIPIENTS_KEY, JSON.stringify(updated))
  return updated
}
