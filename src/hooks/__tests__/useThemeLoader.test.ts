import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useThemeLoader } from '../useThemeLoader'

// Mock fetch
global.fetch = vi.fn()

describe('useThemeLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useThemeLoader('default'))
    
    expect(result.current.customCss).toBe('')
    expect(result.current.isCustomTheme).toBe(false)
    expect(result.current.baseThemeName).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('should load theme CSS successfully', async () => {
    const mockCss = '.test { color: red; }'
    ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockCss)
    })

    const { result } = renderHook(() => useThemeLoader('default'))
    
    await act(async () => {
      await result.current.handleThemeChange('default')
    })

    expect(result.current.customCss).toBe(mockCss)
    expect(result.current.isCustomTheme).toBe(false)
    expect(global.fetch).toHaveBeenCalledWith('/themes/default.css')
  })

  it('should handle theme loading errors', async () => {
    ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 404
    })

    const { result } = renderHook(() => useThemeLoader('default'))
    
    await act(async () => {
      await result.current.handleThemeChange('nonexistent')
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle custom CSS changes', () => {
    const { result } = renderHook(() => useThemeLoader('default'))
    
    act(() => {
      result.current.handleCustomCssChange('.custom { color: blue; }')
    })

    expect(result.current.customCss).toBe('.custom { color: blue; }')
    expect(result.current.isCustomTheme).toBe(true)
  })

  it('should validate external URLs', async () => {
    const { result } = renderHook(() => useThemeLoader('default'))
    
    await act(async () => {
      await result.current.handleThemeChange('https://evil.com/theme.css')
    })

    expect(result.current.error).toBeDefined()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should allow whitelisted external domains', async () => {
    const mockCss = '.external { color: green; }'
    ;(global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockCss)
    })

    const { result } = renderHook(() => useThemeLoader('default'))
    
    await act(async () => {
      await result.current.handleThemeChange('https://cdn.jsdelivr.net/theme.css')
    })

    expect(result.current.customCss).toBe(mockCss)
    expect(global.fetch).toHaveBeenCalledWith('https://cdn.jsdelivr.net/theme.css', {
      mode: 'cors',
      credentials: 'omit'
    })
  })

  it('should sanitize theme names', async () => {
    const { result } = renderHook(() => useThemeLoader('default'))
    
    await act(async () => {
      await result.current.handleThemeChange('../../../etc/passwd')
    })

    expect(result.current.error).toBeDefined()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should reset state', () => {
    const { result } = renderHook(() => useThemeLoader('default'))
    
    act(() => {
      result.current.handleCustomCssChange('.custom { color: blue; }')
    })

    expect(result.current.isCustomTheme).toBe(true)

    act(() => {
      result.current.reset()
    })

    expect(result.current.customCss).toBe('')
    expect(result.current.isCustomTheme).toBe(false)
    expect(result.current.baseThemeName).toBeUndefined()
    expect(result.current.error).toBeUndefined()
  })
})
