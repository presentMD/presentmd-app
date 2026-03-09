import { useState, useCallback, useRef } from 'react';
import { log } from '@/lib/logger';

export interface PresentationModeState {
  isPresentationMode: boolean;
  presentationSlideIndex: number;
  enterPresentationMode: (startIndex?: number) => void;
  exitPresentationMode: () => void;
  goToNextSlide: () => void;
  goToPreviousSlide: () => void;
  goToFirstSlide: () => void;
  goToLastSlide: () => void;
  goToSlide: (index: number) => void;
}

export const usePresentationMode = (totalSlides: number): PresentationModeState => {
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationSlideIndex, setPresentationSlideIndex] = useState(0);
  const slideIndexRef = useRef(presentationSlideIndex);
  slideIndexRef.current = presentationSlideIndex;

  const enterPresentationMode = useCallback((startIndex: number = 0) => {
    const slideIndex = Math.max(0, Math.min(startIndex, totalSlides - 1));
    setPresentationSlideIndex(slideIndex);
    setIsPresentationMode(true);
    log.presentationMode('enter', slideIndex);
  }, [totalSlides]);

  const exitPresentationMode = useCallback(() => {
    setIsPresentationMode(false);
    log.presentationMode('exit', slideIndexRef.current);
  }, []);

  const goToNextSlide = useCallback(() => {
    setPresentationSlideIndex(prev => Math.min(prev + 1, totalSlides - 1));
  }, [totalSlides]);

  const goToPreviousSlide = useCallback(() => {
    setPresentationSlideIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goToFirstSlide = useCallback(() => {
    setPresentationSlideIndex(0);
  }, []);

  const goToLastSlide = useCallback(() => {
    setPresentationSlideIndex(totalSlides - 1);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setPresentationSlideIndex(Math.max(0, Math.min(index, totalSlides - 1)));
  }, [totalSlides]);

  // Keyboard handling removed from this hook.
  // PresentationMode.tsx registers its own stable listener via the ref pattern,
  // which avoids the re-registration gap that caused dropped keypresses.

  return {
    isPresentationMode,
    presentationSlideIndex,
    enterPresentationMode,
    exitPresentationMode,
    goToNextSlide,
    goToPreviousSlide,
    goToFirstSlide,
    goToLastSlide,
    goToSlide,
  };
};
