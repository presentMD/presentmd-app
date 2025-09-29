import { useMemo, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { linter, Diagnostic } from "@codemirror/lint";
import { autocompletion, CompletionContext, Completion } from "@codemirror/autocomplete";
import { oneDark } from "@codemirror/theme-one-dark";
import { useTheme } from "@/contexts/ThemeContext";
import { EditorView } from "@codemirror/view";

export interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

// Simple presentation-aware linting (no YAML frontmatter required)
function marpLinter(): (view: unknown) => Diagnostic[] {
  return (view) => {
    // view comes from CodeMirror; use type-safe access via index signature
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v: any = view;
    const text: string = v.state.doc.toString();
    const diags: Diagnostic[] = [];

    // No YAML frontmatter warnings - metadata is ignored
    // Just check for basic presentation structure

    // Slide separators (ignore ones inside code fences)
    const lines = text.split(/\n/);
    let inFence = false;
    let sepCount = 0;
    lines.forEach((line, i) => {
      if (/^```/.test(line)) inFence = !inFence;
      if (!inFence && /^---\s*$/.test(line)) sepCount++;
    });
    
    // Only suggest slide separators if there's content but no separators
    if (sepCount === 0 && text.trim().length > 0) {
      // Check if there are multiple headings (potential slides without separators)
      const headingCount = (text.match(/^#{1,6}\s+/gm) || []).length;
      if (headingCount > 1) {
        diags.push({
          from: 0,
          to: Math.min(text.length, 3),
          message: "Consider adding `---` between slides to separate them.",
          severity: "info",
        });
      }
    }

    // Basic per-slide heading check
    const slides = splitSlides(text);
    let running = 0;
    slides.forEach((s, idx) => {
      const hasHeading = /^\s*#{1,6}\s+/m.test(s);
      if (!hasHeading && s.trim().length > 0) {
        diags.push({
          from: running,
          to: running + Math.min(s.length, 20),
          message: `Slide ${idx + 1} has no heading. Consider adding a title (e.g., # My Title).`,
          severity: "info",
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
    { label: "---", type: "keyword", apply: "---\n", info: "Slide separator" },
    { label: "# Title", type: "keyword", apply: "# Title\n\n", info: "Main heading" },
    { label: "## Subtitle", type: "keyword", apply: "## Subtitle\n\n", info: "Subheading" },
    { label: "### Section", type: "keyword", apply: "### Section\n\n", info: "Section heading" },
    { label: "<!-- _class: lead -->", type: "property", apply: "<!-- _class: lead -->\n", info: "Lead slide class" },
    { label: "<!-- _backgroundColor: -->", type: "property", apply: "<!-- _backgroundColor: #color -->\n", info: "Background color directive" },
    { label: "![bg]", type: "property", apply: "![bg](image.jpg)\n", info: "Background image" },
    { label: "![bg left]", type: "property", apply: "![bg left](image.jpg)\n", info: "Left background image" },
  ];

  if (atLineStart) return { from: ctx.pos, options: snippets };
  if (!word) return null;
  return { from: word.from, options: snippets };
}

export default function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

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
          theme={theme === 'dark' ? oneDark : undefined}
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
