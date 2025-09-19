import { useMemo, useRef } from "react";
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
    // view comes from CodeMirror; use type-safe access via index signature
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

      // Metadata-specific validation: title is mandatory and must be non-empty
      if (!/\btitle:\s*.+/m.test(fm)) {
        diags.push({
          from: 0,
          to: metaLength,
          message: "Front matter must include a non-empty `title: \"Your Title\"` entry.",
          severity: "warning",
        });
      }
    }

    // Slide separators (ignore ones inside code fences)
    const lines = text.split(/\n/);
    let inFence = false;
    let sepCount = 0;
    let offset = 0;
    lines.forEach((line, i) => {
      if (/^```/.test(line)) inFence = !inFence;
      if (!inFence && /^---\s*$/.test(line)) sepCount++;
      offset += line.length + 1;
    });
    if (sepCount === 0) {
      diags.push({
        from: 0,
        to: Math.min(text.length, 3),
        message: "Add `---` between slides to separate them.",
        severity: "info",
      });
    }

    // Basic per-slide heading check — run on the content after front matter
    const textAfterMeta = metaLength > 0 ? text.slice(metaLength) : text;
    const slides = splitSlides(textAfterMeta);
    let running = metaLength; // offset diagnostics so they point into original text
    slides.forEach((s, idx) => {
      const hasHeading = /^\s*#{1,6}\s+/m.test(s);
      if (!hasHeading) {
        diags.push({
          from: running,
          to: running + Math.min(s.length, 20),
          message: `Slide ${idx + 1} has no heading. Add a title (e.g., \n# My Title).`,
          severity: "warning",
        });
      }
      running += s.length + 4; // approx for separators
    });

    return diags;
  };
}

function splitSlides(text: string): string[] {
  const out: string[] = [];
  const lines = text.split(/\n/);
  let buf: string[] = [];
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;
    if (!inFence && /^---\s*$/.test(line)) {
      out.push(buf.join("\n"));
      buf = [];
    } else {
      buf.push(line);
    }
  }
  out.push(buf.join("\n"));
  return out;
}

function marpCompletions(ctx: CompletionContext) {
  const word = ctx.matchBefore(/\w[\w-]*$/);
  const atLineStart = ctx.state.doc.lineAt(ctx.pos).from === ctx.pos;

  const snippets: Completion[] = [
    {
      label: "Marp front matter",
      type: "keyword",
      apply: "---\nmarp: true\ntheme: default\npaginate: true\n---\n",
      info: "Insert Marp front matter",
    },
    { label: "---", type: "keyword", apply: "---\n", info: "Slide separator" },
    { label: "class: lead", type: "property", apply: "class: lead\n", info: "Large lead slide" },
    { label: "backgroundImage:", type: "property", apply: 'backgroundImage: url("")\n', info: "Slide background image" },
    { label: "style: |", type: "property", apply: "style: |\n  section {\n    /* custom CSS */\n  }\n", info: "Inline style block" },
  ];

  if (atLineStart) return { from: ctx.pos, options: snippets };
  if (!word) return null;
  return { from: word.from, options: snippets };
}

export default function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  const extensions = useMemo(
    () => [
      markdown(),
      linter(marpLinter()),
      autocompletion({ override: [marpCompletions] }),
      EditorView.lineWrapping,
    ],
    []
  );

  return (
    <div ref={ref} className={`h-full overflow-hidden ${className}`}>
      <div className="h-full overflow-auto scrollbar-visible">
        <CodeMirror
          value={value}
          height="100%"
          width="100%"
          extensions={extensions}
          onChange={onChange}
          basicSetup={{ 
            highlightActiveLine: true, 
            lineNumbers: true,
            foldGutter: true,
          }}
          style={{
            fontSize: '14px',
            maxWidth: '100%',
            overflow: 'auto'
          }}
        />
      </div>
    </div>
  );
}
