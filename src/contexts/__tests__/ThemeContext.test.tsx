import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { ThemeProvider, useTheme } from '../ThemeContext'

// Wrap every renderHook call in the ThemeProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Ensure localStorage returns null by default (no stored preference)
    ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null)
    // Clean up classes added to documentElement
    document.documentElement.classList.remove('dark', 'light')
  })

  it('defaults to dark mode when nothing is stored', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('dark')
  })

  it('restores a stored light theme from localStorage', () => {
    ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('light')
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('light')
  })

  it('restores a stored dark theme from localStorage', () => {
    ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('dark')
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('dark')
  })

  it('setTheme switches to light', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => result.current.setTheme('light'))
    expect(result.current.theme).toBe('light')
  })

  it('setTheme persists to localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => result.current.setTheme('light'))
    expect(localStorage.setItem).toHaveBeenCalledWith('presentmd-theme', 'light')
  })

  it('toggleTheme switches dark → light', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    // default is dark
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
  })

  it('toggleTheme switches light → dark', () => {
    ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('light')
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('applies the theme class to documentElement', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    // Default dark
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => result.current.setTheme('light'))
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('throws when useTheme is used outside a ThemeProvider', () => {
    // Suppress React's error boundary console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider'
    )
    spy.mockRestore()
  })
})
