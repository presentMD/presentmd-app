import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TabbedEditor from "@/components/TabbedEditor";
import Preview from "@/components/Preview";
import { ChevronLeft, ChevronRight, X, Monitor, Download } from "lucide-react";
import SlideRenderer from "@/components/slides/SlideRenderer";
import { parseSlides, extractTheme, cleanSlideContent, determineSlideClass } from "@/components/slides/utils";

import ThemeSelector from "@/components/ThemeSelector";
import HelpDialog from "@/components/HelpDialog";
import PptxGenJS from "pptxgenjs";

const initialMd = `---
title: "My Presentation"
theme: space
marp: true
paginate: true
author: "Jane Doe"
---

# Welcome to My Presentation

A subtitle for the title slide
By Jane Doe

<!-- This is a note for the presenter, it won't show on the slide -->

--- 

## Sample Content Slide

- Use **Markdown** to write slides
- Separate slides with \`---\`
- Click Present to launch slideshow

---

## Slide with Content

- Bullet point 1
- Bullet point 2
- **Bold text** and *italic text*

--- 

<!-- _class: custom-hero -->
## Same Slide with _class

- Bullet point 1
- Bullet point 2
- **Bold text** and *italic text*

--- 

## Final Thought
The future isn't coming — it's already here 🚀

--- 

# Thak You!
Please share feedback at [GitHub](https://github.com/ezborgy/presentMD)
`;

// Theme definitions
const THEME_DEFINITIONS = [
  { name: "Default", value: "default" },
  { name: "Gaia", value: "gaia" },
  { name: "Uncover", value: "uncover" },
  { name: "Space", value: "space" },
  { name: "Desert", value: "desert" },
];

const Index = () => {
  const [md, setMd] = useState<string>(initialMd);
  const [current, setCurrent] = useState(0);
  const [customCss, setCustomCss] = useState<string>("");
  const [isCustomTheme, setIsCustomTheme] = useState(false);
  const [baseThemeName, setBaseThemeName] = useState<string | undefined>();
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationSlideIndex, setPresentationSlideIndex] = useState(0);
  
  const { toast } = useToast();

  // Extract current theme from markdown frontmatter
  const currentTheme = useMemo(() => {
    const themeMatch = md.match(/^theme:\s*(.+)$/m);
    return themeMatch ? themeMatch[1].replace(/['"]/g, '') : 'default';
  }, [md]);

  // Parse slides for presentation mode
  const slides = useMemo(() => parseSlides(md), [md]);
  const presentationTheme = useMemo(() => extractTheme(md), [md]);

  // Load theme CSS content
  const loadThemeCss = async (themeName: string): Promise<string> => {
    try {
      if (themeName.startsWith('http')) {
        const response = await fetch(themeName);
        return await response.text();
      }
      
      const response = await fetch(`/themes/${themeName}.css`);
      if (!response.ok) {
        throw new Error(`Failed to load theme: ${themeName}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error loading theme CSS:', error);
      return '';
    }
  };

  // Load initial theme CSS
  useEffect(() => {
    const loadInitialCss = async () => {
      if (currentTheme && currentTheme !== 'custom' && !customCss) {
        const css = await loadThemeCss(currentTheme);
        setCustomCss(css);
        setIsCustomTheme(false);
        setBaseThemeName(undefined);
      }
    };
    loadInitialCss();
  }, [currentTheme, customCss]);

  // Handle theme change by updating frontmatter and loading CSS
  const handleThemeChange = async (theme: string) => {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = md.match(frontMatterRegex);
    
    if (theme === 'custom') {
      // When marking as custom, update frontmatter but don't load new CSS
      if (match) {
        const frontMatter = match[1];
        const updatedFrontMatter = frontMatter.replace(
          /^theme:\s*.*$/m,
          'theme: custom'
        );
        const newMd = md.replace(frontMatterRegex, `---\n${updatedFrontMatter}\n---`);
        setMd(newMd);
      }
      setIsCustomTheme(true);
    } else {
      // Load new theme CSS
      const css = await loadThemeCss(theme);
      setCustomCss(css);
      setIsCustomTheme(false);
      setBaseThemeName(undefined);
      
      if (match) {
        const frontMatter = match[1];
        const themeValue = theme.startsWith('http') ? `'${theme}'` : theme;
        const updatedFrontMatter = frontMatter.replace(
          /^theme:\s*.*$/m,
          `theme: ${themeValue}`
        );
        const newMd = md.replace(frontMatterRegex, `---\n${updatedFrontMatter}\n---`);
        setMd(newMd);
      }
    }
  };

  const handleCustomCssChange = (css: string) => {
    setCustomCss(css);
    
    // Try to detect if CSS matches a known theme
    const detectBaseTheme = async () => {
      for (const theme of THEME_DEFINITIONS) {
        const originalCss = await loadThemeCss(theme.value);
        if (originalCss && css.trim() === originalCss.trim()) {
          setBaseThemeName(theme.name);
          return;
        }
      }
      setBaseThemeName(undefined);
    };
    
    if (!isCustomTheme) {
      setIsCustomTheme(true);
      detectBaseTheme();
    }
  };

  // Ensure the selected theme's stylesheet is loaded into the document head.
  // This loads files from /themes/<name>.css for named themes, or uses the
  // provided URL for custom themes (http... or absolute paths).
  useEffect(() => {
    const id = 'presentmd-theme-css';

    // For custom themes, inject CSS directly
    if (isCustomTheme && customCss) {
      let style = document.getElementById(id) as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement('style');
        style.id = id;
        document.head.appendChild(style);
      }
      style.textContent = customCss;
      return;
    }

    const computeHref = (themeVal: string) => {
      if (!themeVal || themeVal === 'custom') return '';
      // If it's a URL (starts with http or /), use as-is. Otherwise map to /themes/<name>.css
      if (themeVal.startsWith('http') || themeVal.startsWith('/')) return themeVal;
      return `/themes/${themeVal}.css`;
    };

    const href = computeHref(currentTheme);
    if (!href) return;

    let link = document.getElementById(id) as HTMLLinkElement | null;
    // Remove style element if it exists and replace with link
    const existingStyle = document.getElementById(id) as HTMLStyleElement | null;
    if (existingStyle && existingStyle.tagName === 'STYLE') {
      existingStyle.remove();
      link = null;
    }

    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Only update href if changed to avoid reloading unnecessarily
    if (link.href !== href) {
      link.href = href;
    }

    return () => {
      // Cleanup handled by next effect invocation
    };
  }, [currentTheme, isCustomTheme, customCss]);

  useEffect(() => {
    document.title = "presentMD - Markdown to Presentation";
    const desc = "Let's use Markdown to write our next presentation. Build beautiful slide decks with live preview and presenter mode.";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
    // Canonical
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (!existingCanonical) {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = window.location.origin + "/";
      document.head.appendChild(link);
    }
  }, []);

  const enterPresentationMode = () => {
    setPresentationSlideIndex(current);
    setIsPresentationMode(true);
  };

  const exitPresentationMode = () => {
    setIsPresentationMode(false);
  };

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (!isPresentationMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exitPresentationMode();
        return;
      }
      
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setPresentationSlideIndex(i => Math.min(i + 1, slides.length - 1));
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key === "Backspace") {
        e.preventDefault();
        setPresentationSlideIndex(i => Math.max(i - 1, 0));
      }
      if (e.key.toLowerCase() === "home") setPresentationSlideIndex(0);
      if (e.key.toLowerCase() === "end") setPresentationSlideIndex(slides.length - 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentationMode, slides.length]);

  const exportToPowerPoint = async () => {
    try {
      const pptx = new PptxGenJS();
      
      // Parse slides from markdown using the same logic as preview
      const slides = md.split(/^---\s*$/m).map(slide => slide.trim()).filter(slide => slide.length > 0);
      
      slides.forEach((slideContent, index) => {
        const slide = pptx.addSlide();
        
        // Extract title and content
        const lines = slideContent.trim().split('\n').filter(line => line.trim());
  let title = '';
  const content: string[] = [];
        
        for (const line of lines) {
          if (line.startsWith('# ')) {
            title = line.replace('# ', '');
          } else if (line.startsWith('## ')) {
            title = line.replace('## ', '');
          } else if (line.startsWith('- ')) {
            content.push(line.replace('- ', '• '));
          } else if (line.trim() && !line.startsWith('title:') && !line.startsWith('marp:') && !line.startsWith('theme:') && !line.startsWith('paginate:') && !line.startsWith('author:')) {
            content.push(line);
          }
        }
        
        // Add title if present
        if (title) {
          slide.addText(title, {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 1,
            fontSize: 36,
            bold: true,
            color: '363636'
          });
        }
        
        // Add content
        if (content.length > 0) {
          slide.addText(content.join('\n'), {
            x: 0.5,
            y: title ? 2 : 1,
            w: 9,
            h: 5,
            fontSize: 18,
            color: '363636'
          });
        }
      });
      
      // Generate and download
      await pptx.writeFile({ fileName: "presentation.pptx" });
      
      toast({
        title: "Export Successful",
        description: "PowerPoint file has been downloaded!",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting to PowerPoint.",
        variant: "destructive",
      });
    }
  };

  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const setOffset = () => {
      const headerEl = headerRef.current;
      const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 80;
      // add some padding for spacing
      document.documentElement.style.setProperty('--panel-offset', `${Math.ceil(headerHeight)}px`);
    };
    setOffset();
    window.addEventListener('resize', setOffset);
    return () => window.removeEventListener('resize', setOffset);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container py-8 space-y-8">
        <header ref={headerRef}>
          {/* Navigation Bar */}
          <nav className="flex items-center justify-between py-4">
            <div className="flex items-center">
                <h1
                  className="text-2xl font-mono"
                  style={{
                    fontFamily: "'Fira Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace'",
                    textShadow: "0 2px 12px rgba(128,0,255,0.18), 0 1px 2px rgba(0,0,0,0.12)",
                  }}
                >
                  <span
                    className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-normal text-neutral-600"
                    style={{
                      textShadow: "0 2px 12px rgba(0,128,255,0.25), 0 1px 2px rgba(0,0,0,0.12)",
                    }}
                  >
                    present
                  </span>
                  <span
                    className="text-purple-600 italic font-extrabold"
                    style={{
                      textShadow: "0 2px 16px rgba(128,0,255,0.45), 0 1px 2px rgba(0,0,0,0.12)",
                    }}
                  >
                    MD
                  </span>
                </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <HelpDialog />
              <ThemeSelector 
                currentTheme={currentTheme} 
                onThemeChange={handleThemeChange} 
              />
              <Button variant="outline" onClick={exportToPowerPoint} className="shadow-sm">
                <Download className="w-4 h-4 mr-2" />
                Export as PowerPoint
              </Button>
              <Button onClick={enterPresentationMode} className="shadow-lg">
                <Monitor className="w-4 h-4 mr-2" />
                Presentation Mode
              </Button>
            </div>
          </nav>
        </header>

  <section className="flex gap-6 h-[calc(100vh-180px)]">
          {/* Editor Panel */}
          <div className="w-1/2 min-w-0">
            <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-4 shadow-lg transition-all duration-300 hover:shadow-xl h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                <span className="text-sm text-muted-foreground">Editor</span>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <TabbedEditor 
                  markdown={md} 
                  onMarkdownChange={setMd}
                  currentTheme={currentTheme}
                  onThemeChange={handleThemeChange}
                  customCss={customCss}
                  onCustomCssChange={handleCustomCssChange}
                  isCustomTheme={isCustomTheme}
                  baseThemeName={baseThemeName}
                />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 min-w-0">
            <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-4 shadow-lg transition-all duration-300 hover:shadow-xl h-full overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">Preview</span>
              </div>
              <div className="h-[calc(100%-3rem)] overflow-hidden">
                <Preview markdown={md} current={current} onChangeSlide={setCurrent} customCss={customCss} />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-card/30 backdrop-blur-sm">
          <div className="py-6 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>© 2025 Markdown Presentations</span>
              <span className="hidden sm:inline">•</span>
              <a 
                href="https://github.com/ezborgy/presentMD" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline underline-offset-4"
              >
                GitHub
              </a>
              <span className="hidden sm:inline">•</span>
              <span>Open Source</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Presentation Mode Overlay */}
      {isPresentationMode && (
        <div className="fixed inset-0 w-screen h-screen bg-background text-foreground overflow-hidden z-50">
          {/* Custom CSS injection */}
          {customCss && (
            <style>{customCss}</style>
          )}
          
          {/* Exit button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={exitPresentationMode}
            className="absolute top-8 right-8 bg-black/20 hover:bg-black/40 text-white border-0 w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-200 z-10"
          >
            <X size={24} />
          </Button>
          
          {/* Navigation Arrows */}
          {presentationSlideIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPresentationSlideIndex(i => Math.max(i - 1, 0))}
              className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0 w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-200 z-10"
            >
              <ChevronLeft size={24} />
            </Button>
          )}

          {presentationSlideIndex < slides.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPresentationSlideIndex(i => Math.min(i + 1, slides.length - 1))}
              className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0 w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-200 z-10"
            >
              <ChevronRight size={24} />
            </Button>
          )}

          <div className="presentmd-scope w-full h-full">
            <SlideRenderer 
              content={cleanSlideContent(slides[presentationSlideIndex] || '')} 
              theme={presentationTheme}
              className={`w-full h-full presentation-mode ${determineSlideClass(slides[presentationSlideIndex] || '')}`}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default Index;
