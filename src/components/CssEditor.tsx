import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { EditorView } from "@codemirror/view";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface CssEditorProps {
  value: string;
  onChange: (val: string) => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  className?: string;
}

const THEME_OPTIONS = [
  { name: "Default", value: "default" },
  { name: "Gaia", value: "gaia" },
  { name: "Uncover", value: "uncover" },
  { name: "Space", value: "space" },
  { name: "Desert", value: "desert" },
  { name: "Dracula", value: "dracula" },
];

export default function CssEditor({ 
  value, 
  onChange, 
  currentTheme, 
  onThemeChange, 
  className 
}: CssEditorProps) {
  const extensions = useMemo(() => [
    css(),
    EditorView.theme({
      "&": {
        fontSize: "14px",
      },
      ".cm-content": {
        padding: "16px",
        minHeight: "300px",
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
    }),
  ], []);

  return (
    <div className={className}>
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">
          Theme
        </label>
        <Select value={currentTheme} onValueChange={onThemeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            {THEME_OPTIONS.map((theme) => (
              <SelectItem key={theme.value} value={theme.value}>
                {theme.name}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom CSS</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">
          Custom CSS
        </label>
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          height="400px"
          placeholder="/* Add your custom CSS here... */"
        />
      </div>
    </div>
  );
}