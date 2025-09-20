# presentMD

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)

A tiny story: imagine you have a great idea and ten minutes to turn it into a slide deck. You want to iterate quickly, ask an LLM to generate content, and polish the output — all without wrestling with a heavy slide editor. That’s the problem presentMD was built to solve.

presentMD lets you write slides in plain Markdown, preview them instantly, and present or export them to PowerPoint. It focuses on fast iteration, readable source files (perfect for LLM workflows), and themeable visual styles that won’t interfere with the surrounding UI.

Personal note

This project is my first "vibe coding" app. I built most of presentMD during September 2025, iterating quickly and experimenting with ideas and layouts. The development process leaned heavily on a small set of creative tools: Loveable, GitHub Copilot, ChatGPT, and Preplexity's Comet browser.

Why you might like presentMD

- Speed: author slides in your editor, hit preview, and iterate.
- Text-first: everything is Markdown so it works well with LLM-generated content or simple keyboard-driven workflows.
- Portable output: present in the browser or export to `.pptx` for sharing.

Who is this for?

- Engineers and technical presenters who prefer writing in Markdown.
- Product folks who prototype talk outlines with LLMs and want immediate visual feedback.
- Anyone who needs a lightweight, text-first slide tool that exports to standard formats.

Quick tour

- Authoring: Create slides using Markdown. Split slides with `---` and use frontmatter for metadata (title, theme, author, paginate).
- Preview: Live thumbnails, highlighting of the current slide, and automatic scrolling keep the visual context synced while you edit.
- Speaker notes: Add notes inside HTML comments; they’ll appear in the presenter panel but not on slides.
- Themes: pick from built-in themes (Default, Gaia, Uncover, Space, Desert, Dracula) or add your own CSS under `public/themes/`.
- Export: click the header button to generate a `.pptx` version of your slides.

Quickstart

Requirements

- Node.js 18+ recommended
- npm (or your preferred package manager)

Run locally

```bash
git clone https://github.com/presentMD/presentmd-app
cd presentMD
npm install
npm run dev

# open http://localhost:5173 and start writing
```

Building for production

```bash
npm run build
npm run preview
```

How themes work (short)

Theme CSS lives in `public/themes/*.css`. To prevent theme styles from leaking into the rest of the app, presentMD scopes theme rules under a `.presentmd-scope` container that wraps the rendered slide and thumbnail content. If you add a `desert.css` (or any other theme), put its rules under `.presentmd-scope` or simply add the file and select it from the theme dropdown — presentMD will load `/themes/<name>.css` for the selected theme.

Authoring tips and examples

- Basic slide:

```markdown
---
title: "Launch Status"
theme: desert
marp: true
paginate: true
---

# Launch Summary

- Release readiness: ✅
- Open risks: 2

<!-- Presenter note: highlight the launch checklist -->
```

- Use HTML comments to add speaker notes: `<!-- Note ... -->`.
- Use `<!-- _class: title -->` to apply a class to a Marp-style slide (presentMD will preserve these directives).

Developers: structure and code pointers

- Tech stack: React + TypeScript + Vite + Tailwind.
- Markdown rendering: `react-markdown` with `remark-gfm`.
- Slide logic: `src/components/slides/*` contains renderer and utilities for parsing slides, extracting frontmatter, and cleaning content.
- Themes: `public/themes/*.css` — space, desert, gaia, uncover, default, dracula.

Contributing

Contributions welcome. A few suggestions:

- Open an issue or PR at: https://github.com/presentMD/presentmd-app
- Run the app locally and add tests or small fixes on feature branches.
- Follow the existing TypeScript and Tailwind patterns; run `npm run lint` before submitting.

Next steps and ideas

- Add a theme preview grid in the selector so users can see a thumbnail before applying.
- Improve theme loading UX (preload, loading indicator, graceful fallback on error).
- Add slide-level layouts and an optional WYSIWYG title editor.

License

This project is licensed under the MIT License — see the `LICENSE` file for details.

Project

- https://github.com/presentMD/presentmd-app

Enjoy writing slides as text.
