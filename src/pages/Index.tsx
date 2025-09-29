import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TabbedEditor from "@/components/TabbedEditor";
import Preview from "@/components/Preview";
import { ChevronLeft, ChevronRight, X, Monitor, Download, RotateCcw } from "lucide-react";
import SlideRenderer from "@/components/slides/SlideRenderer";
import { parseSlides, extractTheme, cleanSlideContent, determineSlideClass } from "@/components/slides/utils";

import ThemeSelector from "@/components/ThemeSelector";
import ThemeModeSwitcher from "@/components/ThemeModeSwitcher";
import HelpDialog from "@/components/HelpDialog";
import PptxGenJS from "pptxgenjs";

const initialMd = `

# Enter Title Here

Your subtitle here
By Your Name

<!-- Notes: This is a note for the presenter, it won't show on the slide -->

---

## This is a sample slide

* Bullet 1
* Bullet 2
* Bullet 3
`;

// Theme definitions
const THEME_DEFINITIONS = [
  { name: "Default", value: "default" },
  { name: "Space", value: "space" },
  { name: "Desert", value: "desert" },
];

const Index = () => {
  const [md, setMd] = useState<string>(initialMd);
  const [showDiscussionPopup, setShowDiscussionPopup] = useState<boolean>(true);
  const [current, setCurrent] = useState(0);
  const [customCss, setCustomCss] = useState<string>("");
  const [isCustomTheme, setIsCustomTheme] = useState(false);
  const [baseThemeName, setBaseThemeName] = useState<string | undefined>();
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationSlideIndex, setPresentationSlideIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<string>('default');
  
  const { toast } = useToast();

  // Function to reset to clean presentation
  const resetToCleanPresentation = () => {
    setMd(initialMd);
    toast({
      title: "Reset",
      description: "Reset to basic 1-slide template",
    });
  };

  // Auto-detect when content is cleared and reset to clean presentation
  useEffect(() => {
    const trimmedMd = md.trim();
    const isEmpty = trimmedMd === '' || trimmedMd === '---' || trimmedMd === '---\n---';
    const isInitialContent = md === initialMd;
    
    // Only auto-reset if content is empty AND it's not already the initial content
    if (isEmpty && !isInitialContent) {
      setMd(initialMd);
      toast({
        title: "Auto-Reset",
        description: "Content was cleared, reset to clean presentation",
      });
    }
  }, [md]);

  // Use selected theme from UI instead of parsing from markdown
  const currentTheme = selectedTheme;

  // Parse slides for presentation mode
  const slides = useMemo(() => parseSlides(md), [md]);
  const presentationTheme = selectedTheme;

  // Validate URL for security
  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  // Load theme CSS content with security validation
  const loadThemeCss = async (themeName: string): Promise<string> => {
    try {
      if (themeName.startsWith('http')) {
        // Validate URL before fetching
        if (!isValidUrl(themeName)) {
          throw new Error('Invalid URL format');
        }
        
        // Check for allowed domains (whitelist approach)
        const allowedDomains = [
          'cdn.jsdelivr.net',
          'unpkg.com',
          'github.com',
          'raw.githubusercontent.com'
        ];
        
        const url = new URL(themeName);
        if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
          throw new Error('Domain not allowed for external themes');
        }
        
        const response = await fetch(themeName, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load external theme: ${response.status}`);
        }
        
        const css = await response.text();
        
        // Basic CSS validation (prevent malicious CSS)
        if (css.includes('javascript:') || css.includes('expression(')) {
          throw new Error('Invalid CSS content detected');
        }
        
        return css;
      }
      
      // Only allow local theme files
      const sanitizedThemeName = themeName.replace(/[^a-zA-Z0-9-_]/g, '');
      if (sanitizedThemeName !== themeName) {
        throw new Error('Invalid theme name');
      }
      
      const response = await fetch(`/themes/${sanitizedThemeName}.css`);
      if (!response.ok) {
        throw new Error(`Failed to load theme: ${sanitizedThemeName}`);
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

  // Handle theme change by updating state and loading CSS
  const handleThemeChange = async (theme: string) => {
    // Update selected theme state
    setSelectedTheme(theme);
    
    if (theme === 'custom') {
      // When marking as custom, don't load new CSS
      setIsCustomTheme(true);
    } else {
      // Load new theme CSS
      const css = await loadThemeCss(theme);
      setCustomCss(css);
      setIsCustomTheme(false);
      setBaseThemeName(undefined);
    }
  };

  const handleCustomCssChange = (css: string) => {
    setCustomCss(css);
    
    // Track custom CSS usage
    if (css.trim()) {
    }
    
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
    // Track presentation mode start
    
    setPresentationSlideIndex(current);
    setIsPresentationMode(true);
  };

  const exitPresentationMode = () => {
    // Track presentation mode end
    
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

  // Helper function to convert image URL to base64 data
  const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      return '';
    }
  };

  // Theme configurations for PowerPoint export
  const getThemeConfig = (theme: string) => {
    const themeConfigs = {
      space: {
        background: { type: 'solid', color: '#110e3b' },
        backgroundImage: '/images/NASA-main_image_star-forming_region_carina_nircam_final-5mb.jpeg',
        titleBackgroundImage: '/images/NASA-cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L3BkMzYtMS1nc2ZjXzIwMTcxMjA4X2FyY2hpdmVfZTAwMjA3Ni5qcGc.png',
        titleColor: '#ffacfc',
        textColor: '#ffffff',
        accentColor: '#5c34d6',
        fontFamily: 'Orbitron',
        titleFontFamily: 'Orbitron',
        textFontFamily: 'Roboto',
        titleFontSize: 52,
        textFontSize: 24,
        titleStyle: { bold: true, italic: false },
        textStyle: { bold: false, italic: false },
        overlay: {
          type: 'solid',
          color: '#110e3b',
          transparency: 60
        }
      },
      desert: {
        background: { type: 'solid', color: '#f7e3da' },
        backgroundImage: '/images/keith-hardy-PP8Escz15d8-unsplash.jpg',
        titleBackgroundImage: '/images/wiki-commons-caravan-in-the-desert.jpg',
        titleColor: '#8b4513',
        textColor: '#5e2c38',
        accentColor: '#c29240',
        fontFamily: 'Montserrat',
        titleFontFamily: 'Montserrat',
        textFontFamily: 'Roboto',
        titleFontSize: 52,
        textFontSize: 24,
        titleStyle: { bold: true, italic: false },
        textStyle: { bold: false, italic: false },
        overlay: {
          type: 'solid',
          color: '#f7e3da',
          transparency: 40
        }
      },
      default: {
        background: { type: 'solid', color: '#ffffff' },
        backgroundImage: null,
        titleBackgroundImage: null,
        titleColor: '#246',
        textColor: '#222',
        accentColor: '#48c',
        fontFamily: 'Red Hat Display',
        titleFontFamily: 'Red Hat Display',
        textFontFamily: 'Red Hat Display',
        titleFontSize: 52,
        textFontSize: 24,
        titleStyle: { bold: true, italic: false },
        textStyle: { bold: false, italic: false },
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { position: 0, color: '#ffffff' },
            { position: 100, color: '#f8fafc' }
          ]
        }
      }
    };
    
    return themeConfigs[theme] || themeConfigs.default;
  };

  const exportToPowerPoint = async () => {
    try {
      // Show loading toast
      toast({
        title: "Preparing Export",
        description: "Loading theme assets and generating PowerPoint...",
      });

      const pptx = new PptxGenJS();
      
      // Get current theme
      const theme = currentTheme;
      const themeConfig = getThemeConfig(theme);
      
      // Load background images as base64
      let backgroundImageData = '';
      let titleBackgroundImageData = '';
      
      try {
        if (themeConfig.backgroundImage) {
          backgroundImageData = await getImageAsBase64(themeConfig.backgroundImage);
        }
        if (themeConfig.titleBackgroundImage) {
          titleBackgroundImageData = await getImageAsBase64(themeConfig.titleBackgroundImage);
        }
      } catch (error) {
        console.warn('Could not load background images, using solid colors instead:', error);
      }
      
      // Set presentation properties
      pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
      pptx.layout = 'LAYOUT_16x9';
      
      // Parse slides from markdown using the same logic as preview
      const slides = md.split(/^---\s*$/m).map(slide => slide.trim()).filter(slide => slide.length > 0);
      
      slides.forEach((slideContent, index) => {
        const slide = pptx.addSlide();
        
        // Determine if this is a title slide
        const isTitleSlide = index === 0 || slideContent.includes('title:');
        
        // Set slide background
        if (backgroundImageData && !isTitleSlide) {
          // Use background image for content slides
          slide.background = {
            type: 'solid',
            color: themeConfig.background.color
          };
          // Add background image as a shape
          slide.addImage({
            data: backgroundImageData,
            x: 0,
            y: 0,
            w: 10,
            h: 5.625,
            sizing: { type: 'cover', w: 10, h: 5.625 }
          });
        } else if (titleBackgroundImageData && isTitleSlide) {
          // Use title background image for title slides
          slide.background = {
            type: 'solid',
            color: themeConfig.background.color
          };
          // Add background image as a shape
          slide.addImage({
            data: titleBackgroundImageData,
            x: 0,
            y: 0,
            w: 10,
            h: 5.625,
            sizing: { type: 'cover', w: 10, h: 5.625 }
          });
        } else if (themeConfig.gradient) {
          // Use gradient background
          slide.background = themeConfig.gradient;
        } else {
          // Use solid color background
          slide.background = themeConfig.background;
        }
        
        // Parse slide content more intelligently
        const lines = slideContent.trim().split('\n').filter(line => line.trim());
        let title = '';
        const content: string[] = [];
        const bulletPoints: string[] = [];
        const isFirstSlide = index === 0;
        
        // isTitleSlide is already determined above
        
        for (const line of lines) {
          // Skip frontmatter
          if (line.startsWith('title:') || line.startsWith('marp:') || line.startsWith('theme:') || line.startsWith('paginate:') || line.startsWith('author:')) {
            continue;
          }
          
          if (line.startsWith('# ')) {
            title = line.replace('# ', '');
          } else if (line.startsWith('## ')) {
            title = line.replace('## ', '');
          } else if (line.startsWith('### ')) {
            title = line.replace('### ', '');
          } else if (line.startsWith('- ')) {
            bulletPoints.push(line.replace('- ', '• '));
          } else if (line.startsWith('* ')) {
            bulletPoints.push(line.replace('* ', '• '));
          } else if (line.trim() && !line.startsWith('<!--')) {
            // Skip HTML comments
            content.push(line);
          }
        }
        
        // Combine content and bullet points
        const allContent = [...content, ...bulletPoints];
        
        // Add title if present
        if (title) {
          slide.addText(title, {
            x: 0.5,
            y: isTitleSlide ? 1.8 : 0.5,
            w: 9,
            h: isTitleSlide ? 1.5 : 1,
            fontSize: isTitleSlide ? themeConfig.titleFontSize + 12 : themeConfig.titleFontSize,
            bold: themeConfig.titleStyle.bold,
            italic: themeConfig.titleStyle.italic,
            color: themeConfig.titleColor,
            fontFace: themeConfig.titleFontFamily,
            align: isTitleSlide ? 'center' : 'left',
            valign: isTitleSlide ? 'middle' : 'top',
            shadow: {
              type: 'outer',
              angle: 45,
              blur: 2,
              color: '000000',
              offset: 1,
              opacity: 0.3
            }
          });
        }
        
        // Add content
        if (allContent.length > 0) {
          // Process content to handle basic markdown formatting
          const processedContent = allContent.map(line => {
            // Handle bold text
            line = line.replace(/\*\*(.*?)\*\*/g, '$1');
            // Handle italic text
            line = line.replace(/\*(.*?)\*/g, '$1');
            // Handle links (remove markdown syntax)
            line = line.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
            return line;
          }).join('\n');

          slide.addText(processedContent, {
            x: 0.5,
            y: title ? (isTitleSlide ? 3.8 : 2) : (isTitleSlide ? 2.5 : 1),
            w: 9,
            h: title ? (isTitleSlide ? 1.2 : 3) : (isTitleSlide ? 2.5 : 4),
            fontSize: themeConfig.textFontSize,
            bold: themeConfig.textStyle.bold,
            italic: themeConfig.textStyle.italic,
            color: themeConfig.textColor,
            fontFace: themeConfig.textFontFamily,
            align: isTitleSlide ? 'center' : 'left',
            valign: 'top',
            lineSpacing: 1.3,
            bullet: bulletPoints.length > 0 ? true : false
          });
        }
        
        // Add slide number if not first slide
        if (!isFirstSlide) {
          slide.addText(`${index}`, {
            x: 9.2,
            y: 5.2,
            w: 0.5,
            h: 0.3,
            fontSize: 14,
            color: themeConfig.textColor,
            fontFace: themeConfig.textFontFamily,
            align: 'right',
            valign: 'bottom'
          });
        }
      });
      
      // Generate and download
      await pptx.writeFile({ fileName: `presentation-${theme}.pptx` });
      
      // Track successful export
      
      toast({
        title: "Export Successful",
        description: `PowerPoint file with ${theme} theme has been downloaded!`,
      });
    } catch (error) {
      console.error('Export error:', error);
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
            <div className="flex items-center gap-3">
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
                <div className="relative">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500 dark:bg-orange-600 text-white shadow-lg">
                    <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></span>
                    BETA
                  </span>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
              <HelpDialog />
              <ThemeModeSwitcher />
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

        {/* Community Call-to-Action */}
        {showDiscussionPopup && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4 text-center relative">
            <button
              onClick={() => setShowDiscussionPopup(false)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="Close discussion popup"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="max-w-xl mx-auto">
              <h2 className="text-lg font-semibold text-foreground mb-1">
                💬 Join the Discussion!
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                Love this approach? Share feedback and connect with other users.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href="https://github.com/presentMD/presentmd-app/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  Join Discussions
                </a>
                <a
                  href="https://github.com/presentMD/presentmd-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md hover:bg-accent transition-colors text-sm font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        )}

  <section className="flex gap-6 h-[calc(100vh-180px)]">
          {/* Editor Panel */}
          <div className="w-1/2 min-w-0">
            <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-4 shadow-lg transition-all duration-300 hover:shadow-xl h-full flex flex-col">
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
                  onReset={resetToCleanPresentation}
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
                <Preview markdown={md} current={current} onChangeSlide={setCurrent} customCss={customCss} theme={currentTheme} />
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
              <span className="inline-flex items-center gap-1">
                Beta Version
              </span>
              <span className="hidden sm:inline">•</span>
              <a 
                href="https://github.com/presentMD/presentmd-app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline underline-offset-4"
              >
                GitHub
              </a>
              <span className="hidden sm:inline">•</span>
              <a 
                href="https://github.com/presentMD/presentmd-app/discussions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline underline-offset-4"
              >
                Discussions
              </a>
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
          
          {/* Top Controls */}
          <div className="absolute top-0 right-0 z-20 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={exitPresentationMode}
              className="bg-black/20 hover:bg-black/40 text-white border-0 w-10 h-10 rounded-full backdrop-blur-sm transition-all duration-200"
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
                onClick={() => setPresentationSlideIndex(0)}
                disabled={presentationSlideIndex === 0}
                className="text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPresentationSlideIndex(i => Math.max(i - 1, 0))}
                disabled={presentationSlideIndex === 0}
                className="text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </Button>
              
              <div className="flex items-center gap-2 px-4">
                <span className="text-white/80 text-sm">
                  {presentationSlideIndex + 1} of {slides.length}
                </span>
                <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/60 rounded-full transition-all duration-300"
                    style={{ width: `${((presentationSlideIndex + 1) / slides.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPresentationSlideIndex(i => Math.min(i + 1, slides.length - 1))}
                disabled={presentationSlideIndex === slides.length - 1}
                className="text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPresentationSlideIndex(slides.length - 1)}
                disabled={presentationSlideIndex === slides.length - 1}
                className="text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
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
