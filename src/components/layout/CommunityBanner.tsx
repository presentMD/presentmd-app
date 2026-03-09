import React, { useState } from 'react';

const STORAGE_KEY = 'presentmd-banner-dismissed';

function isDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export const CommunityBanner: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(() => !isDismissed());

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // localStorage unavailable — just hide for this session
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/20 px-4 py-2 text-sm"
    >
      <span className="text-muted-foreground min-w-0 truncate">
        💬 <span className="text-foreground font-medium">Love this?</span>{' '}
        Share feedback and connect with other users —{' '}
        <a
          href="https://github.com/presentMD/presentmd-app/discussions"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join Discussions (opens in new tab)"
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          Join Discussions
        </a>
        {' · '}
        <a
          href="https://github.com/presentMD/presentmd-app"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on GitHub (opens in new tab)"
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          GitHub
        </a>
      </span>

      <button
        onClick={dismiss}
        aria-label="Dismiss this banner"
        className="flex-none p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
      >
        <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
