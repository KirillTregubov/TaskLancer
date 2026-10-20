export const currencies = [
  ['CAD', 'Canadian dollar'],
  ['USD', 'US dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'British pound'],
  ['AUD', 'Australian dollar']
] as const

export function currencyDigits(currency: string): number {
  return (
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).resolvedOptions().maximumFractionDigits ?? 2
  )
}

// Read decimal input as an integer so sums never accumulate floating point errors.
export function toMinorUnits(value: string | number, digits: number): number {
  const match = /^(-?)(\d*)(?:\.(\d*))?$/.exec(String(value).trim())
  if (!match || (!match[2] && !match[3])) {
    throw new Error('Enter a valid amount.')
  }
  const fraction = match[3] ?? ''
  if (/[1-9]/.test(fraction.slice(digits))) {
    throw new Error(`This currency supports ${digits} decimal places.`)
  }
  const units = Number(
    `${match[1]}${match[2] || '0'}${fraction.slice(0, digits).padEnd(digits, '0')}`
  )
  if (!Number.isSafeInteger(units)) {
    throw new Error('The amount is too large.')
  }
  return units
}

export function invoiceTotals(
  amounts: Array<string | number>,
  paid: string | number,
  currency: string
) {
  const digits = currencyDigits(currency)
  const total = amounts.reduce<number>((sum, amount) => {
    const next = sum + toMinorUnits(amount, digits)
    if (!Number.isSafeInteger(next)) throw new Error('The total is too large.')
    return next
  }, 0)
  const amountPaid = toMinorUnits(paid === '' ? '0' : paid, digits)
  if (amountPaid < 0) throw new Error('Amount paid cannot be negative.')
  const balance = total - amountPaid
  if (!Number.isSafeInteger(balance))
    throw new Error('The balance is too large.')
  return { total, amountPaid, balance }
}

export function formatMoney(units: number, currency: string): string {
  const digits = currencyDigits(currency)
  const divisor = 10n ** BigInt(digits)
  const minor = BigInt(units)
  const whole = minor / divisor
  const fraction = ((minor < 0n ? -minor : minor) % divisor)
    .toString()
    .padStart(digits, '0')
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    currencySign: 'accounting'
  })
  // Format the integer exactly; dividing a large amount as a Number can lose cents.
  return formatter
    .formatToParts(units < 0 && whole === 0n ? -0 : whole)
    .map((part) => (part.type === 'fraction' ? fraction : part.value))
    .join('')
}
