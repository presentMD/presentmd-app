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
import { AIGenerateModal } from "@/components/features/AIGenerateModal";

const initialMd = `# presentMD

### Write Markdown. Present Beautifully.

*The open-source editor that turns plain text into professional slide decks*

---

<!-- _class: lead -->

# The Idea Is Simple

Write in **Markdown** · Preview in **real-time** · Export to **PowerPoint**

---

![bg right](/images/NASA-main_image_star-forming_region_carina_nircam_final-5mb.jpeg)

## Why Markdown?

- ✍️ **No formatting panels** — just type and focus on content
- 🔄 **Version-controllable** — your deck lives in a text file
- ⚡ **Instant live preview** — slides update as you type
- 🤖 **AI-ready** — generate a deck from a single prompt
- 📤 **Export to .pptx** — hand it off to anyone, anywhere

*Your entire presentation is portable, searchable, and yours.*

---

## How Slides Work

Separate slides with \`---\` on its own line:

\`\`\`markdown
# Title Slide        ← h1 creates a centered title slide
Your subtitle here

---

## Content Slide     ← h2 creates a standard content slide
- Bullet one
- Bullet two

---

## Another Slide
\`\`\`

Start with a single \`#\` heading for the **title slide**. Use \`##\` for all content slides.

---

## Slide Directives

Control layout and style with HTML comments — invisible to the audience:

| Directive | Effect |
|:---|:---|
| \`<!-- footer: "text" -->\` | Persistent footer across following slides |
| \`<!-- header: "text" -->\` | Persistent header |
| \`<!-- _class: lead -->\` | Dark accent section-break slide |
| \`<!-- _color: #fff -->\` | Override text colour for this slide only |
| \`<!-- _backgroundColor: #111 -->\` | Override background for this slide only |
| \`<!-- Notes: ... -->\` | Speaker notes — hidden from the audience |

---

<!-- footer: "presentMD · Feature Tour · 2026" -->

## Rich Text Formatting

**Bold**, *italic*, ~~strikethrough~~ and \`inline code\` all work as expected.

> "The best presentation tool is the one that gets out of your way."

Links: [visit presentMD](https://presentmd.com) · **[star the repo ⭐](https://github.com)**

Combine: **bold with _nested italic_** · a [link in **bold**](https://presentmd.com)

---

## Unordered & Ordered Lists

**Unordered** — use \`-\` or \`*\`:

- First item — use **bold** for key concepts
- Second item — use *italics* for tone
  - Nested item (2-space indent)
  - Another nested item

**Ordered** — automatic numbering:

1. Open presentMD in your browser
2. Write your slides in Markdown
3. Hit **Present** — done

---

## Comparison Table

| Feature | presentMD | PowerPoint | Google Slides |
|:--------|:---------:|:----------:|:-------------:|
| Version control | ✅ | ❌ | Partial |
| Works offline | ✅ | ✅ | ❌ |
| Keyboard-only workflow | ✅ | ❌ | ❌ |
| AI content generation | ✅ | ❌ | ❌ |
| Export to .pptx | ✅ | Native | ❌ |
| Free & open source | ✅ | ❌ | ❌ |

---

<!-- footer: "" -->

![bg left](/images/keith-hardy-PP8Escz15d8-unsplash.jpg)

## Background Images

Use the \`![bg]\` syntax to add photo backgrounds:

\`\`\`markdown
![bg left](image.jpg)    ← image left, content right
![bg right](image.jpg)   ← image right, content left
![bg cover](image.jpg)   ← full-bleed background
\`\`\`

The \`left\` / \`right\` variants split the slide 50/50 —
photo on one side, your content on the other.

---

<!-- _backgroundColor: #1F3864 -->
<!-- _color: #ffffff -->

## Custom Slide Colors

Override any slide's appearance independently — the rest of your deck is unchanged.

This slide uses **\_backgroundColor: #1F3864** and **\_color: #ffffff**.

Works with any valid CSS value — hex, named colors, rgb(), or hsl().

---

<!-- _class: lead -->

# Smart Diagrams

*Five types · Zero drag-and-drop · All from plain text*

---

## Process Diagram — \`type: process\`

Numbered steps connected by arrows, accent color follows your theme:

\`\`\`diagram
type: process
- Research
- Design
- Prototype
- Test
- Launch
\`\`\`

---

## Cycle Diagram — \`type: cycle\`

Continuous loops — a ↺ automatically closes the flow:

\`\`\`diagram
type: cycle
- Plan
- Build
- Test
- Deploy
- Monitor
\`\`\`

---

## Hierarchy Diagram — \`type: hierarchy\`

Org charts and trees — indent with **2 spaces** per level:

\`\`\`diagram
type: hierarchy
- CTO
  - Engineering
    - Frontend
    - Backend
  - Design
    - UX
    - Brand
\`\`\`

---

## Pyramid Model — \`type: pyramid\`

Priority tiers — first item is the apex, last item is the base:

\`\`\`diagram
type: pyramid
- Self-Actualization
- Esteem
- Love & Belonging
- Safety
- Physiological
\`\`\`

---

## Columns Comparison — \`type: columns\`

Use \`= Header\` to start each column, \`- item\` for bullets within:

\`\`\`diagram
type: columns
= Traditional Tools
- Manual formatting
- File version chaos
- No AI support
- Slow to export
= presentMD
- Write in Markdown
- Git version control
- AI-powered generation
- One-click .pptx export
\`\`\`

---

## Math with KaTeX

Inline with \`$...$\` — block equations with \`$$...$$\`:

**Euler's identity** — perhaps the most beautiful equation in mathematics:

$$e^{i\\pi} + 1 = 0$$

**Quadratic formula:**

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

**Gaussian integral:**

$$\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}$$

---

<!-- Notes: These are speaker notes — only visible in the editor, never shown to the audience. Add talking points, timing reminders, or links here. This slide demonstrates the export and keyboard shortcut features. -->

## Export & Speaker Notes

**Export to PowerPoint** with one click from the toolbar — theme, fonts, and layout carry over to \`.pptx\`.

**Speaker notes** — add \`<!-- Notes: ... -->\` to any slide:

\`\`\`markdown
<!-- Notes: Remind audience about the live demo here. -->
\`\`\`

**Keyboard shortcuts in Presenter Mode:**

| Key | Action |
|:----|:-------|
| \`→\` or \`PageDown\` | Next slide |
| \`←\` or \`PageUp\` | Previous slide |
| \`Home\` / \`End\` | First / last slide |
| \`Esc\` | Exit |

---

<!-- _class: lead -->

# Start Writing Today

**Free · Open Source · Runs entirely in your browser**

*Your whole presentation is just one Markdown file*
`;


const Index = () => {
  const [md, setMd] = useState<string>(initialMd);
  const [current, setCurrent] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<string>('default');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  
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

  const handleInsertGenerated = (content: string) => {
    setMd(content);
    setCurrent(0);
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
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container py-8 space-y-8">
        <Header
          ref={headerRef}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          onExportToPowerPoint={handleExportToPowerPoint}
          onEnterPresentationMode={enterPresentationMode}
          onGenerateWithAI={() => setAiModalOpen(true)}
        />

        <CommunityBanner />

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

      {/* AI Generate Modal */}
      <AIGenerateModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        onInsert={handleInsertGenerated}
      />
    </main>
  );
};

export default Index;
