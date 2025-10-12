import React, { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Monitor } from 'lucide-react';
import HelpDialog from '../HelpDialog';
import ThemeModeSwitcher from '../ThemeModeSwitcher';
import ThemeSelector from '../ThemeSelector';

interface HeaderProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  onExportToPowerPoint: () => void;
  onEnterPresentationMode: () => void;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(({
  currentTheme,
  onThemeChange,
  onExportToPowerPoint,
  onEnterPresentationMode
}, ref) => {
  return (
    <header ref={ref}>
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl font-mono"
            style={{
              fontFamily: "'Fira Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace'",
              textShadow: "0 2px 12px rgba(128,0,255,0.18), 0 1px 2px rgba(0,0,0,0.12)",
            }}
          >
            <span
              className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-normal text-neutral-600"
              style={{
                textShadow: "0 2px 12px rgba(0,128,255,0.25), 0 1px 2px rgba(0,0,0,0.12)",
              }}
            >
              present
            </span>
            <span
              className="text-purple-600 italic font-extrabold"
              style={{
                textShadow: "0 2px 16px rgba(128,0,255,0.45), 0 1px 2px rgba(0,0,0,0.12)",
              }}
            >
              MD
            </span>
          </h1>
          <div className="relative">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500 dark:bg-orange-600 text-white shadow-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5"></span>
              BETA
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <HelpDialog />
          <ThemeModeSwitcher />
          <ThemeSelector 
            currentTheme={currentTheme} 
            onThemeChange={onThemeChange} 
          />
          <Button variant="outline" onClick={onExportToPowerPoint} className="shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export as PowerPoint
          </Button>
          <Button onClick={onEnterPresentationMode} className="shadow-lg">
            <Monitor className="w-4 h-4 mr-2" />
            Presentation Mode
          </Button>
        </div>
      </nav>
    </header>
  );
});

Header.displayName = 'Header';
