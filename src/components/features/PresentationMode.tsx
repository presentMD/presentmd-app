import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import SlideRenderer from '@/components/slides/SlideRenderer';
import { determineSlideClass } from '@/components/slides/utils';
import { usePresentationMode } from '@/hooks/usePresentationMode';

interface PresentationModeProps {
  slides: string[];
  theme: string;
  customCss?: string;
  onExit: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  slides,
  theme,
  customCss,
  onExit,
}) => {
  const {
    presentationSlideIndex,
    goToNextSlide,
    goToPreviousSlide,
    goToFirstSlide,
    goToLastSlide,
  } = usePresentationMode(slides.length);

  // ── Stable callback refs ────────────────────────────────────────────────────
  // Updated on every render (before effects) via useLayoutEffect so the keyboard
  // handler always calls the latest version without needing to re-register.
  const cb = useRef({ goToNextSlide, goToPreviousSlide, goToFirstSlide, goToLastSlide, onExit });
  useLayoutEffect(() => {
    cb.current = { goToNextSlide, goToPreviousSlide, goToFirstSlide, goToLastSlide, onExit };
  });

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  // Empty deps → registered exactly once on mount, removed on unmount.
  // No re-registration gaps that swallow keypresses between renders.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          cb.current.goToNextSlide();
          break;
        case ' ':
          // Skip if a button already has focus — the browser fires its click
          // handler on Space, so we'd double-advance without this guard.
          if (!(e.target instanceof HTMLButtonElement)) {
            e.preventDefault();
            cb.current.goToNextSlide();
          }
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          cb.current.goToPreviousSlide();
          break;
        case 'Home':
          e.preventDefault();
          cb.current.goToFirstSlide();
          break;
        case 'End':
          e.preventDefault();
          cb.current.goToLastSlide();
          break;
        case 'Escape':
          e.preventDefault();
          cb.current.onExit();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // ← empty: stable for the lifetime of the overlay

  // ── Focus the Next button on mount ─────────────────────────────────────────
  // useLayoutEffect runs synchronously before paint so the button is focusable
  // the moment the overlay appears (no waiting for an async useEffect).
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    nextBtnRef.current?.focus();
  }, []);

  const currentSlide = slides[presentationSlideIndex] || '';
  const isFirst = presentationSlideIndex === 0;
  const isLast  = presentationSlideIndex === slides.length - 1;

  // White focus ring visible against the dark overlay backdrop
  const navBtn = [
    'text-white/80 hover:text-white hover:bg-white/20',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-black/60',
  ].join(' ');

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-background text-foreground overflow-hidden z-50"
      role="dialog"
      aria-modal="true"
      aria-label={`Presentation — slide ${presentationSlideIndex + 1} of ${slides.length}`}
    >
      {customCss && <style>{customCss}</style>}

      {/* ── Exit button — top right ────────────────────────────────────────── */}
      <div className="absolute top-0 right-0 z-20 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className={`bg-black/20 hover:bg-black/40 text-white border-0 w-10 h-10 rounded-full backdrop-blur-sm transition-all duration-200 ${navBtn}`}
          aria-label="Exit presentation (Esc)"
          aria-keyshortcuts="Escape"
        >
          <X size={20} />
        </Button>
      </div>

      {/* ── Bottom navigation bar ──────────────────────────────────────────── */}
      <nav
        aria-label="Slide navigation"
        className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent pt-10 pb-4 px-4"
      >
        <div className="flex items-center justify-center gap-4">

          <Button
            variant="ghost"
            size="sm"
            onClick={goToFirstSlide}
            disabled={isFirst}
            className={navBtn}
            aria-label="First slide"
            aria-keyshortcuts="Home"
          >
            First
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousSlide}
            disabled={isFirst}
            className={navBtn}
            aria-label="Previous slide"
            aria-keyshortcuts="ArrowLeft PageUp"
          >
            <ChevronLeft size={20} />
          </Button>

          {/* Progress indicator — live region announces slide changes to AT */}
          <div
            id="slide-progress"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Slide ${presentationSlideIndex + 1} of ${slides.length}`}
            className="flex items-center gap-2 px-4"
          >
            <span className="text-white/80 text-sm" aria-hidden="true">
              {presentationSlideIndex + 1} / {slides.length}
            </span>
            <div
              className="w-32 h-1 bg-white/20 rounded-full overflow-hidden"
              aria-hidden="true"
            >
              <div
                className="h-full bg-white/60 rounded-full transition-all duration-300"
                style={{ width: `${((presentationSlideIndex + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Next — receives focus on mount so keyboard works immediately */}
          <Button
            ref={nextBtnRef}
            variant="ghost"
            size="icon"
            onClick={goToNextSlide}
            disabled={isLast}
            className={navBtn}
            aria-label="Next slide"
            aria-keyshortcuts="ArrowRight PageDown"
          >
            <ChevronRight size={20} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToLastSlide}
            disabled={isLast}
            className={navBtn}
            aria-label="Last slide"
            aria-keyshortcuts="End"
          >
            Last
          </Button>

        </div>

        {/* Keyboard shortcut hint */}
        <p className="mt-2 text-center text-[11px] text-white/40 select-none" aria-hidden="true">
          ← → navigate &nbsp;·&nbsp; Esc exit
        </p>
      </nav>

      {/* ── Slide content ──────────────────────────────────────────────────── */}
      <div className="presentmd-scope w-full h-full">
        <SlideRenderer
          content={currentSlide}
          theme={theme}
          className={`w-full h-full presentation-mode ${determineSlideClass(currentSlide)}`}
        />
      </div>
    </div>
  );
};
