import { describe, expect, test } from 'bun:test'

import { PREFILLS_KEY } from '../app/utils/prefills'
import { RECIPIENTS_KEY, readRecipients, writeRecipient } from '../app/utils/recipients'

function storage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

describe('saved recipients', () => {
  test('keeps multiple multiline recipients, deduplicates, and removes only the chosen one', () => {
    const store = storage()
    const first = 'Example Studio\n123 Main St\nToronto'
    writeRecipient(store, first, true)
    writeRecipient(store, 'Another Client', true)
    writeRecipient(store, ` ${first} `, true)
    expect(readRecipients(store)).toEqual([first, 'Another Client'])
    writeRecipient(store, first, false)
    expect(readRecipients(store)).toEqual(['Another Client'])
    expect(() => writeRecipient(store, '  ', true)).toThrow()
    expect(readRecipients(store)).toEqual(['Another Client'])
  })

  test('preserves legacy Bill To and does not resurrect removed recipients', () => {
    const store = storage({
      [PREFILLS_KEY]: JSON.stringify({
        billToField: 'Legacy Client',
        companyName: 'My Company',
      }),
    })
    expect(readRecipients(store)).toEqual(['Legacy Client'])
    writeRecipient(store, 'New Client', true)
    expect(readRecipients(store)).toEqual(['Legacy Client', 'New Client'])
    writeRecipient(store, 'Legacy Client', false)
    writeRecipient(store, 'New Client', false)
    expect(readRecipients(store)).toEqual([])
    expect(JSON.parse(store.getItem(PREFILLS_KEY)!)).toEqual({
      billToField: 'Legacy Client',
      companyName: 'My Company',
    })
  })

  test('ignores malformed entries and reports storage write failures', () => {
    for (const raw of ['{', 'null', '{}']) {
      expect(readRecipients(storage({ [RECIPIENTS_KEY]: raw }))).toEqual([])
    }
    expect(
      readRecipients(storage({ [RECIPIENTS_KEY]: JSON.stringify([' A ', '', 3, null, 'A']) })),
    ).toEqual(['A'])
    const store = storage()
    expect(() =>
      writeRecipient(
        {
          getItem: store.getItem,
          setItem: () => {
            throw new Error('quota')
          },
        },
        'Client',
        true,
      ),
    ).toThrow('quota')
    expect(readRecipients(store)).toEqual([])
  })
})
