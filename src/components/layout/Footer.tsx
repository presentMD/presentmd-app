import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-card/30 backdrop-blur-sm">
      <div className="py-6 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>© 2025 Markdown Presentations</span>
          <span className="hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-1">
            Beta Version
          </span>
          <span className="hidden sm:inline">•</span>
          <a 
            href="https://github.com/presentMD/presentmd-app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline underline-offset-4"
          >
            GitHub
          </a>
          <span className="hidden sm:inline">•</span>
          <a 
            href="https://github.com/presentMD/presentmd-app/discussions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline underline-offset-4"
          >
            Discussions
          </a>
        </div>
      </div>
    </footer>
  );
};
