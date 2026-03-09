# presentMD

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
[![Netlify Status](https://api.netlify.com/api/v1/badges/bc4ec898-915d-4118-a5e4-c433b3048fa6/deploy-status)](https://app.netlify.com/projects/presentmd/deploys)

A tiny story: imagine you have a great idea and ten minutes to turn it into a slide deck. You want to iterate quickly, ask an LLM to generate content, and polish the output — all without wrestling with a heavy slide editor. That's the problem presentMD was built to solve.

presentMD lets you write slides in plain Markdown, preview them instantly, and present or export them to PowerPoint. It focuses on fast iteration, readable source files (perfect for LLM workflows), and themeable visual styles that won't interfere with the surrounding UI.

🌐 **Live project**: [presentmd.app](https://presentmd.app)

## Why you might like presentMD

- **Speed:** author slides in your editor, hit preview, and iterate.
- **Text-first:** everything is Markdown, so it works well with LLM-generated content or simple keyboard-driven workflows.
- **Portable output:** present in the browser or export to `.pptx` for sharing.

## Who is this for?

- Engineers and technical presenters who prefer writing in Markdown.
- Product folks who prototype talk outlines with LLMs and want immediate visual feedback.
- Anyone who needs a lightweight, text-first slide tool that exports to standard formats.

## Quick tour

- **Authoring:** Write slides in Markdown and split them with `---`. No YAML frontmatter is required — themes are controlled via the theme selector in the UI.
- **Directives:** Use HTML comments to customise individual slides without touching any config files. For example: `<!-- _color: red -->`, `<!-- _backgroundColor: #1a1a2e -->`, `<!-- _class: lead -->`, `<!-- header: "My header" -->`, `<!-- footer: "2026 | presentMD" -->`.
- **Background images:** Use `![bg](image.jpg)`, `![bg left](image.jpg)`, or `![bg fit](image.jpg)` to add background images to any slide.
- **Preview:** Live slide view with correct 16:9 aspect ratio, a thumbnail strip with automatic scrolling, and inline pagination. A **Notes** tab shows speaker notes for the current slide.
- **Speaker notes:** Add notes inside HTML comments (e.g. `<!-- Remind the audience of Q3 goals -->`); they appear in the Notes tab of the preview panel but not on the slide itself.
- **Themes:** Choose from built-in themes (Default, Space, Desert), edit the active theme's CSS directly in the CSS panel, or load a theme from an external CDN URL.
- **Export:** Click the header button to generate a `.pptx` version of your slides, with theme-aware colours and fonts applied automatically.

## Quickstart

### Requirements

- Node.js 18+
- npm (or your preferred package manager)

### Run locally

```bash
git clone https://github.com/presentMD/presentmd-app
cd presentmd-app
npm install
npm run dev

# Open http://localhost:5173 and start writing
```

### Build for production

```bash
npm run build
npm run preview
```

### Run tests

```bash
npm run test        # watch mode
npm run test:run    # single run
npm run test:coverage
```

## How themes work

Theme CSS files live in `public/themes/*.css`. To prevent styles from leaking into the rest of the app, presentMD scopes all theme rules under a `.presentmd-scope` container that wraps rendered slide and thumbnail content.

To add a custom theme, place a CSS file in `public/themes/` (for example `mytheme.css`) and write your rules under `.presentmd-scope`. Then select it from the theme dropdown — presentMD will load `/themes/mytheme.css` automatically.

You can also edit any theme's CSS live in the CSS panel on the right side of the editor. Changes take effect immediately and are scoped to the current session.

## Authoring tips and examples

**Basic slide (no frontmatter needed):**

```markdown
# Launch Summary

- Release readiness: ✅
- Open risks: 2

<!-- Remind the audience of the launch checklist -->

---

## Risks

| Risk | Owner | Status |
|------|-------|--------|
| API latency | Platform | In progress |

---

<!-- _color: white -->
<!-- _backgroundColor: #1a1a2e -->

## Custom styled slide

Dark background, white text — no CSS required.
```

**Persistent headers and footers:**

```markdown
<!-- header: "My Presentation" -->
<!-- footer: "2026 | presentMD.com" -->

# First slide

Header and footer will appear on every subsequent slide until cleared.
```

**Background images:**

```markdown
![bg left](https://example.com/photo.jpg)

## Split layout

Image fills the left half; content lives on the right.
```

**Slide classes (Marp-compatible):**

Use `<!-- _class: lead -->` to apply named CSS classes defined in your theme file.

## Developers: structure and code pointers

- **Tech stack:** React + TypeScript + Vite + Tailwind CSS
- **Markdown rendering:** `react-markdown` with `remark-gfm` (tables, task lists) and `remark-math` + `rehype-katex` (LaTeX math)
- **Code editor:** CodeMirror 6 via `@uiw/react-codemirror`
- **Slide logic:** `src/components/slides/` — renderer and utilities for parsing slides, extracting directives, and cleaning content before render
- **Theme loading:** `src/hooks/useThemeLoader.ts` — fetches CSS, validates URLs, and injects `<style>` or `<link>` tags into the document head
- **PowerPoint export:** `src/services/pptxExporter.ts` — converts parsed slides to `.pptx` using `pptxgenjs`, with theme-aware colours and fonts from `src/config/themes.ts`
- **Accessibility:** WCAG 2.2 Level A compliant — skip link, labelled inputs, `scope` on table headers, `aria-hidden` on decorative SVGs, and new-tab warnings on external links

## Contributing

Contributions are welcome. A few guidelines:

- Open an issue or PR at: https://github.com/presentMD/presentmd-app
- Run the app locally and add tests or small fixes on feature branches.
- Follow the existing TypeScript and Tailwind patterns; run `npm run lint` before submitting.

## Next steps and ideas

- Add a theme preview grid so users can see a thumbnail before applying a theme.
- Improve theme loading UX: preloading, a visible loading indicator, and graceful fallbacks on error.
- Add slide-level layout options and an optional WYSIWYG title editor.
- Expand the directive system with transitions and animations.

## License

This project is licensed under the MIT License — see the `LICENSE` file for details.

---

Enjoy writing slides as text.

---

## Architecture

### Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build tool | Vite 5 with SWC |
| Routing | React Router 6 |
| Styling | Tailwind CSS 3 |
| Component primitives | Radix UI |
| Code editor | CodeMirror 6 (`@uiw/react-codemirror`) |
| Markdown rendering | `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex` |
| State (async) | TanStack React Query 5 |
| PowerPoint export | `pptxgenjs` |
| Security | DOMPurify |
| Testing | Vitest + Testing Library |

---

### Directory structure

```
presentmd-app/
├── public/
│   └── themes/              # CSS theme files (default, space, desert)
└── src/
    ├── App.tsx              # Root: providers, router, skip link
    ├── pages/
    │   ├── Index.tsx        # Main editor page (/ route)
    │   ├── Present.tsx      # Full-screen presentation (/present route)
    │   └── NotFound.tsx     # 404 page
    ├── components/
    │   ├── slides/
    │   │   ├── SlideRenderer.tsx   # Markdown → HTML slide renderer
    │   │   └── utils.ts            # Slide parsing and directive extraction
    │   ├── features/
    │   │   ├── EditorPanel.tsx     # Left panel wrapper
    │   │   ├── PreviewPanel.tsx    # Right panel wrapper
    │   │   └── PresentationMode.tsx# Full-screen overlay with controls
    │   ├── layout/
    │   │   ├── Header.tsx          # Top nav (theme selector, export, present)
    │   │   ├── Footer.tsx          # Copyright and links
    │   │   └── CommunityBanner.tsx # Dismissible community banner
    │   ├── MarkdownEditor.tsx      # CodeMirror markdown editor
    │   ├── CssEditor.tsx           # CodeMirror CSS editor
    │   ├── TabbedEditor.tsx        # Markdown / CSS tab switcher
    │   ├── Preview.tsx             # Slide preview: main view, thumbnail strip, Notes tab, pagination
    │   ├── ThemeSelector.tsx       # Theme dropdown
    │   ├── MinimalAIAssistant.tsx  # AI-assisted content generation
    │   ├── HelpDialog.tsx          # Documentation modal
    │   ├── ErrorBoundary.tsx       # Top-level error boundary
    │   └── ui/                     # Radix UI primitives (button, dialog, etc.)
    ├── hooks/
    │   ├── useThemeLoader.ts       # CSS fetching, validation, and injection
    │   └── usePresentationMode.ts  # Slide index state and keyboard navigation
    ├── services/
    │   ├── pptxExporter.ts         # PowerPoint export engine
    │   └── mockLLM.ts              # Mock LLM responses for offline use
    ├── contexts/
    │   ├── ThemeContext.tsx         # Dark / light mode (localStorage-backed)
    │   └── LLMContext.tsx          # LLM integration and prompt sanitisation
    ├── config/
    │   └── themes.ts               # Theme configs for rendering and PPTX export
    ├── lib/
    │   ├── utils.ts                # Tailwind class merger (`cn`)
    │   ├── security.ts             # Input sanitisation and URL validation
    │   ├── errorHandler.ts         # Centralised error processing
    │   └── logger.ts               # Structured logger (debug / info / warn / error)
    └── constants/
        └── index.ts                # Themes, keyboard keys, PPTX dimensions, regex patterns
```

---

### Routing

| Route | Component | Description |
|---|---|---|
| `/` | `Index.tsx` | Full editor — split panel with Markdown editor, CSS editor, and live preview |
| `/present` | `Present.tsx` | Full-screen viewer; reads `?md=`, `?css=`, `?theme=`, `?i=` query parameters |
| `*` | `NotFound.tsx` | 404 fallback |

The `/present` route is opened from the main editor and receives the full markdown document, custom CSS, active theme, and starting slide index as URL-encoded query parameters. This makes it self-contained and shareable.

---

### Data flow

```
User types Markdown
       │
       ▼
Index.tsx (md state)
       │
       ├──parseSlides()──► slides[]
       │                       │
       │              SlideRenderer × N
       │              (main slide view + thumbnail strip + Notes tab)
       │
       ├── useThemeLoader
       │     └── fetches /themes/{name}.css
       │           └── injects <link> or <style> into <head>
       │
       └── on "Present" click
             └── PresentationMode overlay
                   └── SlideRenderer (full screen)
                         └── keyboard nav via usePresentationMode
```

---

### Slide parsing pipeline

`parseSlides(markdown)` in `src/components/slides/utils.ts` performs these steps in order:

1. **Strip YAML frontmatter** — removes any leading `---` block that contains recognised YAML keys (e.g. `theme:`, `title:`). Documents without frontmatter are left unchanged.
2. **Split on separators** — splits the remaining content on `---` lines to produce individual slide strings.
3. **Filter metadata-only slides** — removes slides that contain only directive lines with no visible content.
4. **Resolve persistent directives** — tracks `<!-- header: "..." -->` and `<!-- footer: "..." -->` across slides so that once set, they are automatically prepended/appended to all following slides until explicitly cleared.
5. **Return cleaned slide array** — passed to `SlideRenderer` for rendering.

`SlideRenderer` then extracts per-slide directives (`_color`, `_backgroundColor`, background images, headers, footers) from the raw slide string before passing the cleaned content to `react-markdown`.

---

### Theme system

Themes are plain CSS files stored in `public/themes/`. They are applied in two complementary ways:

1. **Global injection** (`useThemeLoader`) — a `<link>` element is added to the document `<head>`, making the theme available to all `.presentmd-scope` containers on the page.
2. **Scoped rendering** (`SlideRenderer`) — each rendered slide is a `<section>` inside a `.presentmd-scope` wrapper. Theme classes from `src/config/themes.ts` add Tailwind utility classes for headings, paragraphs, lists, and code blocks.
3. **Slide-level overrides** — HTML comment directives (`<!-- _color: ... -->`, `<!-- _backgroundColor: ... -->`) inject inline CSS custom properties that override the active theme for a single slide.
4. **PPTX export** — `src/config/themes.ts` also exports `THEME_CONFIGS`, a set of colour, font, and layout values consumed by `pptxExporter.ts` to produce styled PowerPoint files without requiring an external CSS runtime.

---

### Key hooks

#### `useThemeLoader`

Manages all theme state. Fetches theme CSS from `/themes/{name}.css` (or an external CDN URL from the allowlist), validates the response, and injects it into the document head. External URLs are restricted to a domain allowlist (`jsdelivr.net`, `unpkg.com`, `github.com`, `raw.githubusercontent.com`). The CSS editor in the UI writes directly into this hook's `customCss` state, enabling live editing without a page reload.

#### `usePresentationMode`

Tracks the current slide index and the `isPresentationMode` flag. Registers a `keydown` listener when presentation mode is active and removes it on exit. Navigation functions (`goToNext`, `goToPrevious`, `goToFirst`, `goToLast`, `goToSlide`) use functional state updates to avoid stale-closure bugs.

---

### Security

- **HTML sanitisation** — DOMPurify strips dangerous tags and attributes from any user-supplied HTML.
- **CSS sanitisation** — custom CSS is checked for `javascript:`, `expression()`, and `@import` before injection.
- **URL validation** — external theme URLs must use HTTPS and match the domain allowlist.
- **Prompt sanitisation** — LLM prompts are stripped of injection patterns and capped at 10 KB.
- **Path traversal prevention** — theme names are validated against an alphanumeric-plus-hyphen pattern before being used in file paths.
