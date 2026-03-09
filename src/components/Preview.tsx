import { useEffect, useMemo, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import SlideRenderer from "@/components/slides/SlideRenderer";
import { parseSlides, extractSlideTitles, extractSpeakerNotes, determineSlideClass } from "@/components/slides/utils";
import { PreviewErrorBoundary } from "@/components/ErrorBoundary";
import { THUMBNAIL_CONFIG, TIMEOUTS } from "@/constants";


interface PreviewProps {
  markdown: string;
  current: number;
  onChangeSlide: (index: number) => void;
  customCss?: string;
  theme: string;
}

export default function Preview({ markdown, current, onChangeSlide, theme }: PreviewProps) {
  const slides = useMemo(() => parseSlides(markdown), [markdown]);
  const titles = useMemo(() => extractSlideTitles(slides), [slides]);

  // Auto-center current thumbnail
  const thumbsStripRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const id = setTimeout(() => {
      if (typeof window === 'undefined') return;
      const el = thumbsStripRef.current?.querySelector(`[data-thumb-idx="${current}"]`) as HTMLElement | null;
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, TIMEOUTS.THUMBNAIL_SCROLL);
    return () => clearTimeout(id);
  }, [current, slides.length]);

  const currentSlideNotes = useMemo(() => {
    const content = slides[current];
    if (!content) return "";
    return extractSpeakerNotes(content);
  }, [slides, current]);

  const hasNotes = !!currentSlideNotes;

  return (
    <PreviewErrorBoundary>
      <div className="h-full flex flex-col gap-3">

        {/* Main slide — fills all remaining space, maintains 16:9 */}
        <div className="flex-1 min-h-0 rounded-md border bg-transparent flex items-center justify-center overflow-hidden p-4">
          <div className="w-full aspect-[16/9] shadow-lg">
            <div className="w-full h-full presentmd-scope">
              <SlideRenderer
                content={slides[current] || ''}
                theme={theme}
                className={`w-full h-full ${determineSlideClass(slides[current] || '')}`}
              />
            </div>
          </div>
        </div>

        {/* Bottom panel: Slides | Notes tabs + inline pagination */}
        <Tabs defaultValue="slides" className="flex-none rounded-md border bg-card/50 backdrop-blur-sm">

          {/* Tab bar with pagination on the right */}
          <div className="flex items-center border-b px-2">
            <TabsList className="bg-transparent h-10 gap-0.5 p-0 border-0 shadow-none">
              <TabsTrigger
                value="slides"
                className="h-8 px-3 text-xs rounded data-[state=active]:bg-muted data-[state=active]:shadow-none"
              >
                Slides ({slides.length})
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="h-8 px-3 text-xs rounded data-[state=active]:bg-muted data-[state=active]:shadow-none flex items-center gap-1.5"
              >
                Notes
                {hasNotes && (
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-primary"
                    aria-label="This slide has speaker notes"
                  />
                )}
              </TabsTrigger>
            </TabsList>

            {/* Pagination */}
            <div className="ml-auto flex items-center gap-1 pr-1" role="group" aria-label="Slide navigation">
              <button
                onClick={() => onChangeSlide(Math.max(0, current - 1))}
                disabled={current === 0}
                className="px-2.5 py-1 text-sm rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <span
                className="text-xs text-muted-foreground tabular-nums w-16 text-center select-none"
                aria-live="polite"
                aria-atomic="true"
              >
                {current + 1} / {slides.length}
              </span>
              <button
                onClick={() => onChangeSlide(Math.min(slides.length - 1, current + 1))}
                disabled={current === slides.length - 1}
                className="px-2.5 py-1 text-sm rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next slide"
              >
                ›
              </button>
            </div>
          </div>

          {/* Slides tab: thumbnail strip */}
          <TabsContent value="slides" className="m-0 p-0">
            <div className="px-4 py-3">
              <ScrollArea className="w-full">
                <div ref={thumbsStripRef} className="flex gap-2 p-1" style={{ minHeight: 104 }}>
                  {slides.map((slideContent, globalIndex) => {
                    const scale = THUMBNAIL_CONFIG.SCALE;
                    return (
                      <div
                        key={globalIndex}
                        role="button"
                        tabIndex={0}
                        data-thumb-idx={globalIndex}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChangeSlide(globalIndex); }}
                        onClick={() => onChangeSlide(globalIndex)}
                        className={cn(
                          "relative cursor-pointer rounded border-2 transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          current === globalIndex
                            ? "border-primary ring-2 ring-primary/20 shadow-lg bg-primary/5"
                            : "border-border hover:border-muted-foreground"
                        )}
                        aria-label={`Go to slide ${globalIndex + 1}: ${titles[globalIndex]}`}
                        aria-current={current === globalIndex ? "true" : "false"}
                      >
                        <div className="bg-background rounded overflow-hidden" style={{ width: `${THUMBNAIL_CONFIG.WIDTH * 4}px`, height: `${THUMBNAIL_CONFIG.HEIGHT * 4}px` }}>
                          <div
                            className="w-full h-full"
                            style={{
                              transform: `scale(${scale})`,
                              transformOrigin: 'top left',
                              width: `${100 / scale}%`,
                              height: `${100 / scale}%`,
                              overflow: 'hidden',
                            }}
                          >
                            <div className="presentmd-scope w-full h-full text-xs">
                              <SlideRenderer
                                content={slideContent || ''}
                                theme={theme}
                                className={`w-full h-full ${determineSlideClass(slideContent || '')}`}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 truncate">
                          {globalIndex + 1}. {titles[globalIndex]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Notes tab */}
          <TabsContent value="notes" className="m-0">
            {hasNotes ? (
              <ScrollArea className="h-28">
                <p className="p-4 text-sm text-foreground whitespace-pre-wrap">{currentSlideNotes}</p>
              </ScrollArea>
            ) : (
              <div className="h-28 flex items-center justify-center">
                <p className="text-sm text-muted-foreground italic">No speaker notes for this slide</p>
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </PreviewErrorBoundary>
  );
}
