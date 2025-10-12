import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import SlideRenderer from "@/components/slides/SlideRenderer";
import { parseSlides, extractSlideTitles, extractSpeakerNotes, cleanSlideContent, determineSlideClass } from "@/components/slides/utils";
import { PreviewErrorBoundary } from "@/components/ErrorBoundary";
import { THUMBNAIL_CONFIG, TIMEOUTS } from "@/constants";


interface PreviewProps {
  markdown: string;
  current: number;
  onChangeSlide: (index: number) => void;
  customCss?: string;
  theme: string;
}

export default function Preview({ markdown, current, onChangeSlide, customCss, theme }: PreviewProps) {
  // Parse markdown into slides
  const slides = useMemo(() => parseSlides(markdown), [markdown]);
  const titles = useMemo(() => extractSlideTitles(slides), [slides]);

  // Thumbnail pagination
  const [thumbPage, setThumbPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(slides.length / THUMBNAIL_CONFIG.PER_PAGE));

  // Keep thumbnail page in sync with current slide
  useEffect(() => {
    if (!Number.isFinite(current)) return;
    const page = Math.floor(current / THUMBNAIL_CONFIG.PER_PAGE);
    if (page !== thumbPage) setThumbPage(page);
  }, [current, thumbPage]);

  // Auto-center current thumbnail
  const thumbsStripRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const id = setTimeout(() => {
      if (typeof window === 'undefined') return;
      const selector = `[data-thumb-idx="${current}"]`;
      const el = thumbsStripRef.current?.querySelector(selector) as HTMLElement | null;
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        el.focus({ preventScroll: true });
      }
    }, TIMEOUTS.THUMBNAIL_SCROLL);
    return () => {
      clearTimeout(id);
    };
  }, [current, thumbPage, slides.length]);

  // Speaker notes
  const currentSlideNotes = useMemo(() => {
    const currentSlideContent = slides[current];
    if (!currentSlideContent) return "";
    return extractSpeakerNotes(currentSlideContent);
  }, [slides, current]);

  return (
    <PreviewErrorBoundary>
      <div className="h-full flex flex-col">
      {/* Main slide area - 16:9 aspect ratio */}
      <div className="flex-1 rounded-md border bg-transparent flex items-center justify-center overflow-hidden mb-4 p-4">
        <div className="w-full max-w-none aspect-[16/9] shadow-lg">
          {/* Scope theme styles to this container using the presentmd-scope class */}
          <div className="w-full h-full presentmd-scope">
            <SlideRenderer
              content={slides[current] || ''}
              theme={theme}
              className={`w-full h-full ${determineSlideClass(slides[current] || '')}`}
            />
          </div>
        </div>
      </div>

      {/* Speaker notes - fixed height area */}
      <div className="h-32 rounded-md border bg-card/50 backdrop-blur-sm mb-4">
        {currentSlideNotes ? (
          <>
            <div className="px-4 py-2 border-b bg-muted/50">
              <h3 className="text-sm font-medium text-muted-foreground">Speaker Notes</h3>
            </div>
            <ScrollArea className="h-24">
              <div className="p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{currentSlideNotes}</p>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No speaker notes for this slide</p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="mt-4 rounded-md border bg-card/50 backdrop-blur-sm">
        <div className="px-4 py-2 border-b bg-muted/50 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Slides ({titles.length})</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChangeSlide(Math.max(0, current - 1))}
              disabled={current === 0}
              className="px-3 py-1 text-xs rounded bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous slide"
            >
              ‹
            </button>
            <span className="text-xs text-muted-foreground px-2" aria-live="polite">{current + 1} / {slides.length}</span>
            <button
              onClick={() => onChangeSlide(Math.min(slides.length - 1, current + 1))}
              disabled={current === slides.length - 1}
              className="px-3 py-1 text-xs rounded bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next slide"
            >
              ›
            </button>
          </div>
        </div>

        <div className="px-4 py-3">
          <ScrollArea className="w-full">
            <div ref={thumbsStripRef} className="flex gap-2 p-1" style={{ minHeight: 104 }}>
              {Array.from({ length: THUMBNAIL_CONFIG.PER_PAGE }).map((_, slotIndex) => {
                const globalIndex = thumbPage * THUMBNAIL_CONFIG.PER_PAGE + slotIndex;
                const hasSlide = globalIndex < slides.length;
                if (!hasSlide) return <div key={`ph-${slotIndex}`} className="w-32 h-24 bg-muted/20 rounded border border-border" />;

                const slideContent = slides[globalIndex];
                const scale = THUMBNAIL_CONFIG.SCALE;

                return (
                  <div
                    key={globalIndex}
                    role="button"
                    tabIndex={0}
                    data-thumb-idx={globalIndex}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChangeSlide(globalIndex); }}
                    className={cn(
                      "relative cursor-pointer rounded border-2 transition-all hover:scale-105 focus:outline-none",
                      current === globalIndex ? "border-primary ring-2 ring-primary/20 shadow-lg bg-primary/5" : "border-border hover:border-muted-foreground"
                    )}
                    onClick={() => onChangeSlide(globalIndex)}
                    aria-label={`Go to slide ${globalIndex + 1}: ${titles[globalIndex]}`}
                    aria-current={current === globalIndex ? "true" : "false"}
                  >
                    <div className={`w-${THUMBNAIL_CONFIG.WIDTH} h-${THUMBNAIL_CONFIG.HEIGHT} bg-background rounded overflow-hidden`}>
                      <div
                        className="w-full h-full"
                        style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: `${100 / scale}%`, height: `${100 / scale}%`, overflow: 'hidden' }}
                      >
                        <div className="presentmd-scope w-full h-full text-xs">
                          <SlideRenderer content={slideContent || ''} theme={theme} className={`w-full h-full ${determineSlideClass(slideContent || '')}`} />
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 truncate">{globalIndex + 1}. {titles[globalIndex]}</div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
      </div>
    </PreviewErrorBoundary>
  );
}
