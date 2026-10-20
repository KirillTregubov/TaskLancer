import { describe, expect, test } from 'bun:test'
import {
  PREFILLS_KEY,
  readPrefills,
  writePrefill,
  writePrefills
} from '../app/utils/prefills'

function storage(initial?: string) {
  const values = new Map(initial === undefined ? [] : [[PREFILLS_KEY, initial]])
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    }
  }
}

describe('explicit invoice prefills', () => {
  test('saves fields independently, including multiline and blank defaults', () => {
    const store = storage()
    writePrefill(store, 'companyName', 'Example Studio')
    writePrefill(store, 'address', '123 Example St\nToronto')
    writePrefill(store, 'amountPaid', '')
    expect(readPrefills(store)).toEqual({
      companyName: 'Example Studio',
      address: '123 Example St\nToronto',
      amountPaid: ''
    })
    writePrefill(store, 'companyName', undefined)
    expect(readPrefills(store)).toEqual({
      address: '123 Example St\nToronto',
      amountPaid: ''
    })
  })
  test('only an explicit write updates the persisted default', () => {
    const store = storage()
    writePrefill(store, 'currency', 'CAD')
    const draft = readPrefills(store)
    draft.currency = 'EUR'
    expect(readPrefills(store).currency).toBe('CAD')
    writePrefill(store, 'currency', draft.currency)
    expect(readPrefills(store).currency).toBe('EUR')
  })
  test('stores item descriptions and amounts separately by row position', () => {
    const store = storage()
    writePrefill(store, 'items.1.description', 'Consulting')
    writePrefill(store, 'items.1.amount', '15.25')
    writePrefill(store, 'items.1.amount', undefined)
    expect(readPrefills(store)).toEqual({ 'items.1.description': 'Consulting' })
  })
  test('saves and forgets an entire item with one storage write', () => {
    const store = storage()
    let writes = 0
    const tracked = {
      getItem: store.getItem,
      setItem: (key: string, value: string) => {
        writes++
        store.setItem(key, value)
      }
    }
    writePrefill(store, 'items.0.description', 'Old description')
    writePrefill(store, 'companyName', 'Keep me')
    writePrefills(tracked, {
      'items.0.description': 'Consulting',
      'items.0.amount': '19.99'
    })
    expect(writes).toBe(1)
    expect(readPrefills(store)).toEqual({
      companyName: 'Keep me',
      'items.0.description': 'Consulting',
      'items.0.amount': '19.99'
    })
    writePrefills(tracked, {
      'items.0.description': undefined,
      'items.0.amount': undefined
    })
    expect(writes).toBe(2)
    expect(readPrefills(store)).toEqual({ companyName: 'Keep me' })
  })
  test('ignores corrupted storage and invalid fields', () => {
    for (const raw of ['{', 'null', '[]', '12'])
      expect(readPrefills(storage(raw))).toEqual({})
    expect(
      readPrefills(
        storage(
          JSON.stringify({
            companyName: 'Example',
            amountPaid: 42,
            unknown: 'no',
            'items.9999999.amount': '1'
          })
        )
      )
    ).toEqual({ companyName: 'Example' })
    expect(() => writePrefill(storage(), '__proto__', 'bad')).toThrow()
  })
  test('propagates storage failures so the UI can report a failed save', () => {
    const store = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota')
      }
    }
    expect(() => writePrefill(store, 'email', 'example@example.com')).toThrow(
      'quota'
    )
  })
})
