import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TabbedEditor from "@/components/TabbedEditor";
import Preview from "@/components/Preview";
import { ChevronLeft, ChevronRight, Monitor, Download } from "lucide-react";
import { parseSlides, extractTheme } from "@/components/slides/utils";

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

# Thank You!
Please share feedback at [GitHub](https://github.com/presentMD/presentMD)
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

  const { toast } = useToast();

  // Extract current theme from markdown frontmatter
  const currentTheme = useMemo(() => {
    const themeMatch = md.match(/^theme:\s*(.+)$/m);
    return themeMatch ? themeMatch[1].replace(/['"]/g, '') : 'default';
  }, [md]);

  // Parse slides for navigation
  const slides = useMemo(() => parseSlides(md), [md]);
  const presentationTheme = useMemo(() => extractTheme(md), [md]);

  // Load theme CSS content
  const loadThemeCss = async (themeName: string): Promise<string> => {
    // For now, return empty CSS since we're using built-in themes
    return '';
  };

  // Handle theme change by updating frontmatter
  const handleThemeChange = async (theme: string) => {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = md.match(frontMatterRegex);

    if (theme === 'custom') {
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
    if (!isCustomTheme) {
      setIsCustomTheme(true);
    }
  };

  // Set page title and meta description
  useEffect(() => {
    document.title = "presentMD - Markdown to Presentation";
    const desc = "Create beautiful slide presentations using Markdown. Live preview, multiple themes, and easy sharing.";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  // Navigation handlers
  const goToPrevious = () => {
    setCurrent(Math.max(current - 1, 0));
  };

  const goToNext = () => {
    setCurrent(Math.min(current + 1, slides.length - 1));
  };

  // Present mode handler
  const openPresentationMode = () => {
    const params = new URLSearchParams({
      md: encodeURIComponent(md),
      css: encodeURIComponent(customCss),
      i: current.toString()
    });
    window.open(`/present?${params.toString()}`, '_blank');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">presentMD</h1>
            <p className="text-sm text-muted-foreground">
              Create presentations with Markdown
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Navigation controls */}
            <div className="flex items-center gap-1 mr-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                disabled={current === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm px-2">
                {current + 1} / {slides.length}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={current >= slides.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Action buttons */}
            <Button onClick={openPresentationMode} className="gap-2">
              <Monitor className="h-4 w-4" />
              Present
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Left panel - Editor */}
        <div className="flex-1 min-w-0">
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

        {/* Right panel - Preview */}
        <div className="w-80 flex-shrink-0">
          <Preview
            markdown={md}
            current={current}
            onChangeSlide={setCurrent}
            customCss={customCss}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
