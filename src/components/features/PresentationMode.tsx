import React from 'react';
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
  onExit
}) => {
  const {
    presentationSlideIndex,
    goToNextSlide,
    goToPreviousSlide,
    goToFirstSlide,
    goToLastSlide,
  } = usePresentationMode(slides.length);

  const currentSlide = slides[presentationSlideIndex] || '';

  return (
    <div className="fixed inset-0 w-screen h-screen bg-background text-foreground overflow-hidden z-50">
      {/* Custom CSS injection */}
      {customCss && (
        <style>{customCss}</style>
      )}
      
      {/* Top Controls */}
      <div className="absolute top-0 right-0 z-20 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="bg-black/20 hover:bg-black/40 text-white border-0 w-10 h-10 rounded-full backdrop-blur-sm transition-all duration-200"
          aria-label="Exit presentation mode"
        >
          <X size={20} />
        </Button>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToFirstSlide}
            disabled={presentationSlideIndex === 0}
            className="text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to first slide"
            aria-describedby="slide-progress"
          >
            First
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousSlide}
            disabled={presentationSlideIndex === 0}
            className="text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
            aria-describedby="slide-progress"
          >
            <ChevronLeft size={20} />
          </Button>
          
          <div className="flex items-center gap-2 px-4" id="slide-progress" role="progressbar" aria-valuenow={presentationSlideIndex + 1} aria-valuemin={1} aria-valuemax={slides.length} aria-label={`Slide ${presentationSlideIndex + 1} of ${slides.length}`}>
            <span className="text-white/80 text-sm">
              {presentationSlideIndex + 1} of {slides.length}
            </span>
            <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden" aria-hidden="true">
              <div 
                className="h-full bg-white/60 rounded-full transition-all duration-300"
                style={{ width: `${((presentationSlideIndex + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextSlide}
            disabled={presentationSlideIndex === slides.length - 1}
            className="text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
            aria-describedby="slide-progress"
          >
            <ChevronRight size={20} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToLastSlide}
            disabled={presentationSlideIndex === slides.length - 1}
            className="text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to last slide"
            aria-describedby="slide-progress"
          >
            Last
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
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
