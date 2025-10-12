import React from 'react';
import TabbedEditor from '../TabbedEditor';
import { EditorErrorBoundary } from '../ErrorBoundary';

interface EditorPanelProps {
  markdown: string;
  onMarkdownChange: (value: string) => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  customCss: string;
  onCustomCssChange: (css: string) => void;
  isCustomTheme: boolean;
  baseThemeName?: string;
  onReset: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  markdown,
  onMarkdownChange,
  currentTheme,
  onThemeChange,
  customCss,
  onCustomCssChange,
  isCustomTheme,
  baseThemeName,
  onReset
}) => {
  return (
    <div className="w-1/2 min-w-0">
      <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-4 shadow-lg transition-all duration-300 hover:shadow-xl h-full flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          <EditorErrorBoundary>
            <TabbedEditor 
              markdown={markdown} 
              onMarkdownChange={onMarkdownChange}
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
              customCss={customCss}
              onCustomCssChange={onCustomCssChange}
              isCustomTheme={isCustomTheme}
              baseThemeName={baseThemeName}
              onReset={onReset}
            />
          </EditorErrorBoundary>
        </div>
      </div>
    </div>
  );
};
