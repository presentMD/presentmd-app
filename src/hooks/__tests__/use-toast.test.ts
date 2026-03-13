import { describe, it, expect } from 'vitest'
import { reducer } from '../use-toast'

// The reducer is a pure function – no hooks, no side-effects – so it can be
// unit-tested by feeding it state + action and asserting on the result.

const TOAST_A = { id: '1', title: 'Toast A', open: true } as const
const TOAST_B = { id: '2', title: 'Toast B', open: true } as const

describe('use-toast reducer', () => {
  const empty = { toasts: [] }
  const withA  = { toasts: [TOAST_A] }
  const withAB = { toasts: [TOAST_A, TOAST_B] }

  // ── ADD_TOAST ─────────────────────────────────────────────────────────────
  describe('ADD_TOAST', () => {
    it('adds a toast to an empty list', () => {
      const next = reducer(empty, { type: 'ADD_TOAST', toast: TOAST_A })
      expect(next.toasts).toHaveLength(1)
      expect(next.toasts[0].id).toBe('1')
    })

    it('prepends the new toast', () => {
      const next = reducer(withA, { type: 'ADD_TOAST', toast: TOAST_B })
      expect(next.toasts[0].id).toBe('2')
    })

    it('respects TOAST_LIMIT (1) – older toasts are dropped', () => {
      // TOAST_LIMIT is 1 in the implementation
      const next = reducer(withA, { type: 'ADD_TOAST', toast: TOAST_B })
      expect(next.toasts).toHaveLength(1)
      expect(next.toasts[0].id).toBe('2')
    })
  })

  // ── UPDATE_TOAST ──────────────────────────────────────────────────────────
  describe('UPDATE_TOAST', () => {
    it('updates a toast by id', () => {
      const next = reducer(withA, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated' },
      })
      expect(next.toasts[0].title).toBe('Updated')
    })

    it('does not modify toasts with a different id', () => {
      const next = reducer(withAB, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated' },
      })
      expect(next.toasts[1].title).toBe('Toast B')
    })
  })

  // ── DISMISS_TOAST ─────────────────────────────────────────────────────────
  describe('DISMISS_TOAST', () => {
    it('sets open=false for the specified id', () => {
      const next = reducer(withA, { type: 'DISMISS_TOAST', toastId: '1' })
      expect(next.toasts[0].open).toBe(false)
    })

    it('sets open=false for ALL toasts when toastId is undefined', () => {
      const next = reducer(withAB, { type: 'DISMISS_TOAST', toastId: undefined })
      expect(next.toasts.every(t => t.open === false)).toBe(true)
    })

    it('does not remove the toast – only marks it closed', () => {
      const next = reducer(withA, { type: 'DISMISS_TOAST', toastId: '1' })
      expect(next.toasts).toHaveLength(1)
    })
  })

  // ── REMOVE_TOAST ──────────────────────────────────────────────────────────
  describe('REMOVE_TOAST', () => {
    it('removes the toast with the specified id', () => {
      const next = reducer(withA, { type: 'REMOVE_TOAST', toastId: '1' })
      expect(next.toasts).toHaveLength(0)
    })

    it('leaves other toasts untouched', () => {
      const next = reducer(withAB, { type: 'REMOVE_TOAST', toastId: '1' })
      expect(next.toasts).toHaveLength(1)
      expect(next.toasts[0].id).toBe('2')
    })

    it('clears ALL toasts when toastId is undefined', () => {
      const next = reducer(withAB, { type: 'REMOVE_TOAST', toastId: undefined })
      expect(next.toasts).toHaveLength(0)
    })

    it('is a no-op when the id does not exist', () => {
      const next = reducer(withA, { type: 'REMOVE_TOAST', toastId: 'no-such-id' })
      expect(next.toasts).toHaveLength(1)
    })
  })

  // ── State immutability ────────────────────────────────────────────────────
  it('always returns a new state object', () => {
    const next = reducer(withA, { type: 'DISMISS_TOAST', toastId: '1' })
    expect(next).not.toBe(withA)
    expect(next.toasts).not.toBe(withA.toasts)
  })
})
