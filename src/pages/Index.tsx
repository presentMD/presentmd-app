import { useEffect, useMemo, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseSlides } from "@/components/slides/utils";
import { useThemeLoader } from "@/hooks/useThemeLoader";
import { usePresentationMode } from "@/hooks/usePresentationMode";
import { exportToPowerPoint } from "@/services/pptxExporter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EditorPanel } from "@/components/features/EditorPanel";
import { PreviewPanel } from "@/components/features/PreviewPanel";
import { PresentationMode } from "@/components/features/PresentationMode";
import { CommunityBanner } from "@/components/layout/CommunityBanner";

const initialMd = `

# Enter Title Here

Your subtitle here
By Your Name

<!-- Notes: This is a note for the presenter, it won't show on the slide -->

---

<!-- Footer: "2025 | presentMD.com" -->
## This is a sample slide

* Bullet 1
* Bullet 2
* Bullet 3

---

<!-- _color: red -->
## Custom Text Color

Red text on this slide

`;


const Index = () => {
  const [md, setMd] = useState<string>(initialMd);
  const [showDiscussionPopup, setShowDiscussionPopup] = useState<boolean>(true);
  const [current, setCurrent] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<string>('default');
  
  const { toast } = useToast();
  
  // Use custom hooks
  const themeLoader = useThemeLoader(selectedTheme);
  const slides = useMemo(() => parseSlides(md), [md]);
  const presentationMode = usePresentationMode(slides.length);

  // Function to clear the editor
  const clearEditor = () => {
    setMd('');
    toast({
      title: "Cleared",
      description: "Editor content has been cleared",
    });
  };

  // Load initial theme when component mounts
  useEffect(() => {
    themeLoader.loadInitialTheme(selectedTheme);
  }, [selectedTheme, themeLoader.loadInitialTheme]);

  // Use selected theme from UI instead of parsing from markdown
  const currentTheme = selectedTheme;

  // Handle theme change
  const handleThemeChange = async (theme: string) => {
    setSelectedTheme(theme);
    await themeLoader.handleThemeChange(theme);
  };

  const handleCustomCssChange = (css: string) => {
    themeLoader.handleCustomCssChange(css);
  };

  // Theme CSS injection is now handled by the useThemeLoader hook

  useEffect(() => {
    document.title = "presentMD - Markdown to Presentation (Beta)";
    const desc = "Let's use Markdown to write our next presentation. Build beautiful slide decks with live preview and presenter mode. Currently in beta - feedback welcome!";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
    
    // Track page view
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
    presentationMode.enterPresentationMode(current);
  };

  const exitPresentationMode = () => {
    presentationMode.exitPresentationMode();
  };

  const handleExportToPowerPoint = async () => {
    try {
      await exportToPowerPoint(md, currentTheme, (message) => {
        toast({
          title: "Export Progress",
          description: message,
        });
      });
      
      toast({
        title: "Export Successful",
        description: `PowerPoint file with ${currentTheme} theme has been downloaded!`,
      });
    } catch (error) {
      // Error is already handled by the service
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
        <Header
          ref={headerRef}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          onExportToPowerPoint={handleExportToPowerPoint}
          onEnterPresentationMode={enterPresentationMode}
        />

        <CommunityBanner
          show={showDiscussionPopup}
          onClose={() => setShowDiscussionPopup(false)}
        />

        <section className="flex gap-6 h-[calc(100vh-180px)]">
          <EditorPanel
            markdown={md}
            onMarkdownChange={setMd}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            customCss={themeLoader.customCss}
            onCustomCssChange={handleCustomCssChange}
            isCustomTheme={themeLoader.isCustomTheme}
            baseThemeName={themeLoader.baseThemeName}
            onReset={clearEditor}
          />

          <PreviewPanel
            markdown={md}
            current={current}
            onChangeSlide={setCurrent}
            customCss={themeLoader.customCss}
            theme={currentTheme}
          />
        </section>

        <Footer />
      </div>

      {/* Presentation Mode Overlay */}
      {presentationMode.isPresentationMode && (
        <PresentationMode
          slides={slides}
          theme={currentTheme}
          customCss={themeLoader.customCss}
          onExit={exitPresentationMode}
        />
      )}
    </main>
  );
};

export default Index;
