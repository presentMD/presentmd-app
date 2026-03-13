import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePresentationMode } from '../usePresentationMode'

const TOTAL = 5

describe('usePresentationMode', () => {
  it('starts with presentation mode off at slide 0', () => {
    const { result } = renderHook(() => usePresentationMode(TOTAL))
    expect(result.current.isPresentationMode).toBe(false)
    expect(result.current.presentationSlideIndex).toBe(0)
  })

  // ── Enter / exit ──────────────────────────────────────────────────────────
  describe('enterPresentationMode', () => {
    it('enables presentation mode', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.enterPresentationMode())
      expect(result.current.isPresentationMode).toBe(true)
    })

    it('enters at the given start index', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.enterPresentationMode(3))
      expect(result.current.presentationSlideIndex).toBe(3)
    })

    it('clamps a negative start index to 0', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.enterPresentationMode(-5))
      expect(result.current.presentationSlideIndex).toBe(0)
    })

    it('clamps a start index beyond the last slide', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.enterPresentationMode(99))
      expect(result.current.presentationSlideIndex).toBe(TOTAL - 1)
    })
  })

  describe('exitPresentationMode', () => {
    it('disables presentation mode', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.enterPresentationMode())
      act(() => result.current.exitPresentationMode())
      expect(result.current.isPresentationMode).toBe(false)
    })
  })

  // ── Navigation ────────────────────────────────────────────────────────────
  describe('goToNextSlide', () => {
    it('advances the slide index by one', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.enterPresentationMode(2))
      act(() => result.current.goToNextSlide())
      expect(result.current.presentationSlideIndex).toBe(3)
    })

    it('does not advance beyond the last slide', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.enterPresentationMode(TOTAL - 1))
      act(() => result.current.goToNextSlide())
      expect(result.current.presentationSlideIndex).toBe(TOTAL - 1)
    })
  })

  describe('goToPreviousSlide', () => {
    it('moves the slide index back by one', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.enterPresentationMode(2))
      act(() => result.current.goToPreviousSlide())
      expect(result.current.presentationSlideIndex).toBe(1)
    })

    it('does not go below 0', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.enterPresentationMode(0))
      act(() => result.current.goToPreviousSlide())
      expect(result.current.presentationSlideIndex).toBe(0)
    })
  })

  describe('goToFirstSlide', () => {
    it('jumps to slide 0', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.enterPresentationMode(4))
      act(() => result.current.goToFirstSlide())
      expect(result.current.presentationSlideIndex).toBe(0)
    })
  })

  describe('goToLastSlide', () => {
    it('jumps to the last slide', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.enterPresentationMode(0))
      act(() => result.current.goToLastSlide())
      expect(result.current.presentationSlideIndex).toBe(TOTAL - 1)
    })
  })

  describe('goToSlide', () => {
    it('jumps to the given index', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.goToSlide(2))
      expect(result.current.presentationSlideIndex).toBe(2)
    })

    it('clamps to 0 for negative indices', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.goToSlide(-3))
      expect(result.current.presentationSlideIndex).toBe(0)
    })

    it('clamps to the last slide for out-of-range indices', () => {
      const { result } = renderHook(() => usePresentationMode(TOTAL))
      act(() => result.current.goToSlide(100))
      expect(result.current.presentationSlideIndex).toBe(TOTAL - 1)
    })
  })

  // ── Edge cases ────────────────────────────────────────────────────────────
  it('works correctly when totalSlides is 1', () => {
    const { result } = renderHook(() => usePresentationMode(1))
    act(() => result.current.enterPresentationMode())
    act(() => result.current.goToNextSlide())
    expect(result.current.presentationSlideIndex).toBe(0)
    act(() => result.current.goToPreviousSlide())
    expect(result.current.presentationSlideIndex).toBe(0)
  })
})
