import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { linter, Diagnostic } from "@codemirror/lint";
import { autocompletion, CompletionContext, Completion } from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";

export interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

// Simple Marp-aware linting
function marpLinter(): (view: unknown) => Diagnostic[] {
  return (view) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v: any = view;
    const text: string = v.state.doc.toString();
    const diags: Diagnostic[] = [];

    // Detect YAML front matter (if present) and run metadata-specific checks
    const fmMatch = text.match(/^---\n[\s\S]*?\n---\n?/m);
    let metaLength = 0;
    if (!fmMatch) {
      // No front matter — still warn the user and require a title in metadata
      diags.push({
        from: 0,
        to: Math.min(3, text.length),
        message: "Missing YAML front matter. Add `---` with `marp: true` and a `title: \"Your Title\"`.",
        severity: "warning",
      });
    } else {
      const fm = fmMatch[0];
      metaLength = fm.length;

      // Check for marp: true in front matter
      if (!/\bmarp:\s*true\b/m.test(fm)) {
        diags.push({
          from: 0,
          to: metaLength,
          message: "Front matter should include `marp: true`.",
          severity: "warning",
        });
      }

      // Check for title in front matter
      if (!/\btitle:\s*["'].*["']\s*$/m.test(fm)) {
        diags.push({
          from: 0,
          to: metaLength,
          message: "Front matter should include a `title: \"Your Title\"`.",
          severity: "info",
        });
      }
    }

    // Look for slide separators
    const separators = [...text.matchAll(/^---\s*$/gm)];
    if (separators.length === 0 && metaLength > 0) {
      // Has front matter but no slide separators
      const pos = metaLength;
      diags.push({
        from: pos,
        to: pos + 10,
        message: "Add `---` to separate slides after front matter.",
        severity: "info",
      });
    }

    return diags;
  };
}

// Marp/presentation-specific autocomplete
function marpAutocomplete(context: CompletionContext) {
  const completions: Completion[] = [
    // Front matter completions
    { label: "marp-frontmatter", detail: "Basic Marp front matter", type: "snippet", 
      apply: "---\ntitle: \"My Presentation\"\ntheme: default\nmarp: true\npaginate: true\nauthor: \"Your Name\"\n---\n\n# " },
    { label: "marp: true", detail: "Enable Marp", type: "keyword" },
    { label: "theme: default", detail: "Default theme", type: "keyword" },
    { label: "theme: gaia", detail: "Gaia theme", type: "keyword" },
    { label: "theme: uncover", detail: "Uncover theme", type: "keyword" },
    { label: "theme: space", detail: "Space theme", type: "keyword" },
    { label: "theme: desert", detail: "Desert theme", type: "keyword" },
    { label: "paginate: true", detail: "Enable page numbers", type: "keyword" },
    
    // Slide separators
    { label: "slide-separator", detail: "New slide", type: "snippet", apply: "---\n\n## " },
    
    // Common slide patterns
    { label: "title-slide", detail: "Title slide template", type: "snippet", 
      apply: "# Presentation Title\n\nSubtitle or description\nBy Your Name" },
    { label: "content-slide", detail: "Content slide with bullets", type: "snippet", 
      apply: "## Slide Title\n\n- Point 1\n- Point 2\n- Point 3" },
    { label: "thank-you", detail: "Thank you slide", type: "snippet", 
      apply: "# Thank You!\n\nQuestions?" },
    
    // Special slide classes
    { label: "<!-- _class: lead -->", detail: "Lead slide class", type: "keyword" },
    { label: "<!-- _class: invert -->", detail: "Inverted slide class", type: "keyword" },
  ];

  const word = context.matchBefore(/\w*$/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  
  return {
    from: word.from,
    options: completions
  };
}

export default function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
  const extensions = useMemo(() => [
    markdown(),
    linter(marpLinter()),
    autocompletion({ override: [marpAutocomplete] }),
    EditorView.theme({
      "&": {
        fontSize: "14px",
      },
      ".cm-content": {
        padding: "16px",
        minHeight: "400px",
      },
      ".cm-focused": {
        outline: "none",
      },
      ".cm-editor": {
        borderRadius: "8px",
      },
      ".cm-scroller": {
        fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
      },
      ".cm-lint-marker-warning": {
        content: "⚠️",
      },
      ".cm-lint-marker-info": {
        content: "ℹ️",
      },
    }),
  ], []);

  return (
    <div className={className}>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        height="100%"
        placeholder="Start writing your presentation in Markdown..."
      />
    </div>
  );
}