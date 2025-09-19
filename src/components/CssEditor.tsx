import { useRef, useEffect } from "react";
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { useTheme } from "next-themes";
import { EditorView } from "@codemirror/view";

interface CssEditorProps {
  value: string;
  onChange: (value: string) => void;
  onThemeChange: (theme: string) => void;
  className?: string;
}

const CssEditor = ({ value, onChange, onThemeChange, className = "" }: CssEditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const extensions = [
    css(),
    EditorView.lineWrapping,
  ];

  const handleChange = (val: string) => {
    onChange(val);
    // When CSS is modified, mark theme as custom
    onThemeChange("custom");
  };

  return (
    <div ref={ref} className={`h-full overflow-hidden ${className}`}>
      <div className="h-full overflow-auto scrollbar-visible">
        <CodeMirror
          value={value}
          height="100%"
          width="100%"
          extensions={extensions}
          onChange={handleChange}
          theme={theme === 'dark' ? oneDark : undefined}
          basicSetup={{ 
            highlightActiveLine: true, 
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
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
};

export default CssEditor;