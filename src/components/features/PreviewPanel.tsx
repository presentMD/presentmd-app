import React from 'react';
import Preview from '../Preview';

interface PreviewPanelProps {
  markdown: string;
  current: number;
  onChangeSlide: (index: number) => void;
  customCss?: string;
  theme: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  markdown,
  current,
  onChangeSlide,
  customCss,
  theme
}) => {
  return (
    <div className="w-1/2 min-w-0">
      <div className="rounded-xl border bg-card/50 backdrop-blur-sm p-4 shadow-lg transition-all duration-300 hover:shadow-xl h-full overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-muted-foreground">Preview</span>
        </div>
        <div className="h-[calc(100%-3rem)] overflow-hidden">
          <Preview 
            markdown={markdown} 
            current={current} 
            onChangeSlide={onChangeSlide} 
            customCss={customCss} 
            theme={theme} 
          />
        </div>
      </div>
    </div>
  );
};
