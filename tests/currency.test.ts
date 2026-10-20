import { describe, expect, test } from 'bun:test'
import {
  currencyDigits,
  formatMoney,
  invoiceTotals,
  toMinorUnits
} from '../app/utils/currency'

describe('invoice money', () => {
  test('preserves cents on large values and negative amounts below one unit', () => {
    expect(formatMoney(toMinorUnits('90071992547409.91', 2), 'USD')).toContain(
      '90,071,992,547,409.91'
    )
    expect(formatMoney(-25, 'USD')).toContain('(USD')
    expect(formatMoney(-25, 'USD')).toContain('0.25')
  })
  test('adds decimal lines and subtracts payment exactly', () => {
    expect(invoiceTotals(['0.1', '0.2', '19.99'], '5.04', 'USD')).toEqual({
      total: 2029,
      amountPaid: 504,
      balance: 1525
    })
  })
  test('supports zero and three decimal currencies', () => {
    expect(currencyDigits('JPY')).toBe(0)
    expect(currencyDigits('KWD')).toBe(3)
    expect(invoiceTotals(['1.001', '2.009'], '1.005', 'KWD')).toEqual({
      total: 3010,
      amountPaid: 1005,
      balance: 2005
    })
    expect(formatMoney(1234, 'JPY')).toContain('1,234')
    expect(formatMoney(1234, 'KWD')).toContain('1.234')
    expect(() => toMinorUnits('1.5', 0)).toThrow('decimal places')
  })
  test('handles cleared payments, discounts, zero lines, and overpayments', () => {
    expect(invoiceTotals(['10', '-2.50', '0'], '', 'CAD')).toEqual({
      total: 750,
      amountPaid: 0,
      balance: 750
    })
    expect(invoiceTotals(['10'], '15', 'CAD').balance).toBe(-500)
    expect(formatMoney(-250, 'CAD')).toContain('(CAD')
    expect(formatMoney(250, 'USD')).toContain('USD')
    expect(formatMoney(250, 'CAD')).toContain('CAD')
  })
  test('rejects invalid input, excessive precision, negative payment, and unsafe totals', () => {
    for (const input of [
      '',
      'oops',
      'NaN',
      'Infinity',
      '1e2',
      '1.001',
      '9007199254740992'
    ]) {
      expect(() => toMinorUnits(input, 2)).toThrow()
    }
    expect(() => invoiceTotals(['1'], '-1', 'USD')).toThrow('negative')
    expect(() => invoiceTotals(['90071992547409.90', '1'], '0', 'USD')).toThrow(
      'too large'
    )
    expect(toMinorUnits('1.2300', 2)).toBe(123)
    expect(toMinorUnits('.25', 2)).toBe(25)
  })
})
