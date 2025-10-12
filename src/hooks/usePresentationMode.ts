import { useState, useEffect, useCallback } from 'react';
import { PRESENTATION_KEYS } from '@/constants';
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

  const enterPresentationMode = useCallback((startIndex: number = 0) => {
    const slideIndex = Math.min(startIndex, totalSlides - 1);
    setPresentationSlideIndex(slideIndex);
    setIsPresentationMode(true);
    log.presentationMode('enter', slideIndex);
  }, [totalSlides]);

  const exitPresentationMode = useCallback(() => {
    setIsPresentationMode(false);
    log.presentationMode('exit', presentationSlideIndex);
  }, [presentationSlideIndex]);

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

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (!isPresentationMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (PRESENTATION_KEYS.EXIT.includes(e.key)) {
        e.preventDefault();
        exitPresentationMode();
        return;
      }
      
      if (PRESENTATION_KEYS.NEXT.includes(e.key)) {
        e.preventDefault();
        goToNextSlide();
      }
      if (PRESENTATION_KEYS.PREV.includes(e.key)) {
        e.preventDefault();
        goToPreviousSlide();
      }
      if (PRESENTATION_KEYS.FIRST.includes(e.key.toLowerCase())) {
        goToFirstSlide();
      }
      if (PRESENTATION_KEYS.LAST.includes(e.key.toLowerCase())) {
        goToLastSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentationMode, exitPresentationMode, goToNextSlide, goToPreviousSlide, goToFirstSlide, goToLastSlide]);

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
