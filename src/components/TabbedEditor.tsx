import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import MarkdownEditor from "./MarkdownEditor";
import CssEditor from "./CssEditor";

interface TabbedEditorProps {
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

const TabbedEditor = ({
  markdown,
  onMarkdownChange,
  currentTheme,
  onThemeChange,
  customCss,
  onCustomCssChange,
  isCustomTheme,
  baseThemeName,
  onReset
}: TabbedEditorProps) => {
  const [activeTab, setActiveTab] = useState("markdown");

  const getThemeTabLabel = () => {
    if (isCustomTheme) {
      return baseThemeName ? `Custom (Based on ${baseThemeName})` : "Custom";
    }
    return currentTheme;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-medium">Editor</span>
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
            <TabsTrigger value="theme" className="gap-2">
              Theme
              {isCustomTheme && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  Custom
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          {activeTab === "theme" && (
            <span className="text-sm text-muted-foreground">
              {getThemeTabLabel()}
            </span>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onReset} 
          className="shadow-sm"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>
      
      <div className="flex-1 min-h-0">
        <TabsContent value="markdown" className="h-full mt-0">
          <MarkdownEditor value={markdown} onChange={onMarkdownChange} />
        </TabsContent>
        
        <TabsContent value="theme" className="h-full mt-0">
          <CssEditor 
            value={customCss} 
            onChange={onCustomCssChange}
            onThemeChange={onThemeChange}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default TabbedEditor;