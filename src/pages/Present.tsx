import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SlideRenderer from "@/components/slides/SlideRenderer";
import { parseSlides, cleanSlideContent } from "@/components/slides/utils";
import { PRESENTATION_KEYS } from "@/constants";


const decode = (s: string | null) => {
  try {
    return s ? decodeURIComponent(s) : "";
  } catch {
    return s ?? "";
  }
};

export default function Present() {
  const [params] = useSearchParams();
  const md = decode(params.get("md"));
  const customCss = decode(params.get("css"));
  const theme = decode(params.get("theme")) || "default";
  const startIndex = Number(params.get("i") ?? 0) || 0;

  // Parse markdown into slides
  const slides = useMemo(() => parseSlides(md), [md]);

  const [index, setIndex] = useState(Math.min(startIndex, Math.max(0, slides.length - 1)));

  useEffect(() => {
    document.title = `Presentation — Slide ${index + 1}/${slides.length}`;
  }, [index, slides.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (PRESENTATION_KEYS.NEXT.includes(e.key)) {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, slides.length - 1));
      }
      if (PRESENTATION_KEYS.PREV.includes(e.key)) {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
      if (PRESENTATION_KEYS.FIRST.includes(e.key.toLowerCase())) setIndex(0);
      if (PRESENTATION_KEYS.LAST.includes(e.key.toLowerCase())) setIndex(slides.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const shown = slides[index] || "";

  const goToPrevious = () => setIndex((i) => Math.max(i - 1, 0));
  const goToNext = () => setIndex((i) => Math.min(i + 1, slides.length - 1));

  return (
    <div className="fixed inset-0 w-screen h-screen bg-background text-foreground overflow-hidden">
      {/* Custom CSS injection */}
      {customCss && (
        <style>{customCss}</style>
      )}
      
      {/* Navigation Arrows */}
      {index > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0 w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-200 z-10"
        >
          <ChevronLeft size={24} />
        </Button>
      )}

      {index < slides.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0 w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-200 z-10"
        >
          <ChevronRight size={24} />
        </Button>
      )}

      <div className="presentmd-scope w-full h-full">
        <SlideRenderer 
          content={shown} 
          theme={theme}
          className="w-full h-full presentation-mode"
        />
      </div>
    </div>
  );
}
