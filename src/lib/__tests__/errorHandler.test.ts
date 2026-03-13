import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock toast before importing errorHandler so the import resolves properly
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}))

import { toast } from '@/hooks/use-toast'
import {
  AppError,
  handleError,
  getErrorMessage,
  handleAsyncError,
  handleThemeError,
  handleExportError,
} from '../errorHandler'

const mockToast = toast as ReturnType<typeof vi.fn>

describe('AppError', () => {
  it('creates an AppError with message and name', () => {
    const err = new AppError('Something failed')
    expect(err.message).toBe('Something failed')
    expect(err.name).toBe('AppError')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
  })

  it('stores context and originalError', () => {
    const original = new Error('root cause')
    const err = new AppError('Wrapper', { action: 'doThing' }, original)
    expect(err.context.action).toBe('doThing')
    expect(err.originalError).toBe(original)
  })

  it('defaults context to empty object when not provided', () => {
    const err = new AppError('bare')
    expect(err.context).toEqual({})
  })
})

describe('getErrorMessage', () => {
  it('extracts message from an AppError', () => {
    expect(getErrorMessage(new AppError('app-level'))).toBe('app-level')
  })

  it('extracts message from a plain Error', () => {
    expect(getErrorMessage(new Error('plain error'))).toBe('plain error')
  })

  it('returns string errors as-is', () => {
    expect(getErrorMessage('string error')).toBe('string error')
  })

  it('returns fallback message for unknown types', () => {
    expect(getErrorMessage(42)).toBe('An unexpected error occurred')
    expect(getErrorMessage(null)).toBe('An unexpected error occurred')
    expect(getErrorMessage({})).toBe('An unexpected error occurred')
  })
})

describe('handleError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an AppError', () => {
    const result = handleError(new Error('oops'), 'TestCtx', { showToast: false })
    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe('oops')
  })

  it('wraps a plain Error inside an AppError', () => {
    const result = handleError(new Error('raw'), 'ctx', { showToast: false })
    expect(result.originalError).toBeInstanceOf(Error)
    expect(result.originalError?.message).toBe('raw')
  })

  it('wraps a string error', () => {
    const result = handleError('string failure', 'ctx', { showToast: false })
    expect(result.message).toBe('string failure')
  })

  it('uses fallback message for unknown error types', () => {
    const result = handleError(undefined, 'ctx', { showToast: false })
    expect(result.message).toBe('An unknown error occurred')
  })

  it('calls toast when showToast is true (default)', () => {
    handleError(new Error('toast me'), 'ctx')
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    )
  })

  it('does not call toast when showToast is false', () => {
    handleError(new Error('no toast'), 'ctx', { showToast: false })
    expect(mockToast).not.toHaveBeenCalled()
  })

  it('sets the component on context', () => {
    const result = handleError(new Error('e'), 'MyComponent', { showToast: false })
    expect(result.context.component).toBe('MyComponent')
  })

  it('sets a timestamp on context', () => {
    const result = handleError(new Error('e'), 'ctx', { showToast: false })
    expect(result.context.timestamp).toBeInstanceOf(Date)
  })
})

describe('handleAsyncError', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the resolved value on success', async () => {
    const result = await handleAsyncError(async () => 42, 'ctx')
    expect(result).toBe(42)
  })

  it('returns undefined when the function throws', async () => {
    const result = await handleAsyncError(
      async () => { throw new Error('async failure') },
      'ctx',
      undefined
    )
    expect(result).toBeUndefined()
  })

  it('returns the fallback value when the function throws', async () => {
    const result = await handleAsyncError(
      async () => { throw new Error('fail') },
      'ctx',
      'FALLBACK'
    )
    expect(result).toBe('FALLBACK')
  })

  it('calls toast on async error', async () => {
    await handleAsyncError(async () => { throw new Error('async') }, 'ctx')
    expect(mockToast).toHaveBeenCalled()
  })
})

describe('handleThemeError', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls toast with destructive variant', () => {
    handleThemeError(new Error('theme failed'), 'space')
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    )
  })
})

describe('handleExportError', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls toast with destructive variant', () => {
    handleExportError(new Error('export failed'))
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    )
  })
})
