import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SlideRenderer from "@/components/slides/SlideRenderer";
import { parseSlides, extractTheme } from "@/components/slides/utils";

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
  const startIndex = Number(params.get("i") ?? 0) || 0;

  // Parse markdown into slides
  const slides = useMemo(() => parseSlides(md), [md]);
  const theme = useMemo(() => extractTheme(md), [md]);

  const [index, setIndex] = useState(Math.min(startIndex, Math.max(0, slides.length - 1)));

  useEffect(() => {
    document.title = `Presentation — Slide ${index + 1}/${slides.length}`;
  }, [index, slides.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, slides.length - 1));
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key === "Backspace") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key.toLowerCase() === "home") setIndex(0);
      if (e.key.toLowerCase() === "end") setIndex(slides.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  if (!md || slides.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">No presentation data</h1>
          <p className="text-muted-foreground">Please provide markdown content via URL parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Current slide */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-6xl max-h-[90vh] aspect-video">
          <SlideRenderer
            markdown={slides[index]}
            theme={theme}
            customCss={customCss}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Navigation controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIndex(Math.max(index - 1, 0))}
          disabled={index === 0}
          className="text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-white px-3 text-sm font-medium">
          {index + 1} / {slides.length}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIndex(Math.min(index + 1, slides.length - 1))}
          disabled={index === slides.length - 1}
          className="text-white hover:bg-white/20"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Exit hint */}
      <div className="absolute top-4 right-4 text-white/60 text-sm">
        Press ESC to exit
      </div>
    </div>
  );
}