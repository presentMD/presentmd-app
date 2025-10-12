import { useState, useCallback, useRef, useEffect } from 'react';
import { handleThemeError, handleAsyncError } from '@/lib/errorHandler';
import { SECURITY, REGEX_PATTERNS } from '@/constants';
import { log } from '@/lib/logger';

export interface ThemeLoaderState {
  customCss: string;
  isCustomTheme: boolean;
  baseThemeName?: string;
  isLoading: boolean;
  error?: string;
}

export const useThemeLoader = (initialTheme: string = 'default') => {
  const [state, setState] = useState<ThemeLoaderState>({
    customCss: '',
    isCustomTheme: false,
    baseThemeName: undefined,
    isLoading: false,
    error: undefined,
  });

  const initialLoadComplete = useRef(false);

  // Handle CSS injection into document head
  useEffect(() => {
    const id = 'presentmd-theme-css';

    // For custom themes, inject CSS directly
    if (state.isCustomTheme && state.customCss) {
      let style = document.getElementById(id) as HTMLStyleElement | null;
      if (!style) {
        style = document.createElement('style');
        style.id = id;
        document.head.appendChild(style);
      }
      style.textContent = state.customCss;
      return;
    }

    const computeHref = (themeVal: string) => {
      if (!themeVal || themeVal === 'custom') return '';
      if (themeVal.startsWith('http') || themeVal.startsWith('/')) return themeVal;
      return `/themes/${themeVal}.css`;
    };

    const href = computeHref(initialTheme);
    if (!href) {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
      return;
    }

    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    if (link.href !== href) {
      link.href = href;
    }
  }, [state.isCustomTheme, state.customCss, initialTheme]);

  // Validate URL for security
  const isValidUrl = useCallback((url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, []);

  // Load theme CSS content with security validation
  const loadThemeCss = useCallback(async (themeName: string): Promise<string> => {
    try {
      if (themeName.startsWith('http')) {
        // Validate URL before fetching
        if (!isValidUrl(themeName)) {
          throw new Error('Invalid URL format');
        }
        
        // Check for allowed domains (whitelist approach)
        const url = new URL(themeName);
        if (!SECURITY.ALLOWED_DOMAINS.some(domain => url.hostname.includes(domain))) {
          throw new Error('Domain not allowed for external themes');
        }
        
        const response = await fetch(themeName, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load external theme: ${response.status}`);
        }
        
        const css = await response.text();
        
        // Basic CSS validation (prevent malicious CSS)
        if (css.includes('javascript:') || css.includes('expression(')) {
          throw new Error('Invalid CSS content detected');
        }
        
        log.themeLoad(themeName, true);
        return css;
      }
      
      // Only allow local theme files
      const sanitizedThemeName = themeName.replace(/[^a-zA-Z0-9-_]/g, '');
      if (sanitizedThemeName !== themeName) {
        throw new Error('Invalid theme name');
      }
      
      const response = await fetch(`/themes/${sanitizedThemeName}.css`);
      if (!response.ok) {
        throw new Error(`Failed to load theme: ${sanitizedThemeName}`);
      }
      const css = await response.text();
      log.themeLoad(themeName, true);
      return css;
    } catch (error) {
      log.themeLoad(themeName, false, error instanceof Error ? error.message : 'Unknown error');
      handleThemeError(error, themeName);
      throw error;
    }
  }, [isValidUrl]);

  // Load initial theme CSS
  const loadInitialTheme = useCallback(async (themeName: string) => {
    if (initialLoadComplete.current) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    const result = await handleAsyncError(
      async () => {
        if (themeName && themeName !== 'custom') {
          const css = await loadThemeCss(themeName);
          setState(prev => ({
            ...prev,
            customCss: css,
            isCustomTheme: false,
            baseThemeName: undefined,
            isLoading: false,
          }));
        }
      },
      'useThemeLoader.loadInitialTheme'
    );

    initialLoadComplete.current = true;
    if (!result) {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadThemeCss]);

  // Handle theme change by updating state and loading CSS
  const handleThemeChange = useCallback(async (theme: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    if (theme === 'custom') {
      // When marking as custom, don't load new CSS
      setState(prev => ({
        ...prev,
        isCustomTheme: true,
        isLoading: false,
      }));
    } else {
      // Load new theme CSS
      const result = await handleAsyncError(
        async () => {
          const css = await loadThemeCss(theme);
          setState(prev => ({
            ...prev,
            customCss: css,
            isCustomTheme: false,
            baseThemeName: undefined,
            isLoading: false,
          }));
        },
        'useThemeLoader.handleThemeChange'
      );

      if (!result) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, [loadThemeCss]);

  const handleCustomCssChange = useCallback((css: string) => {
    setState(prev => ({ ...prev, customCss: css }));
    
    // Try to detect if CSS matches a known theme
    const detectBaseTheme = async () => {
      const { THEME_DEFINITIONS } = await import('@/constants');
      for (const theme of THEME_DEFINITIONS) {
        try {
          const originalCss = await loadThemeCss(theme.value);
          if (originalCss && css.trim() === originalCss.trim()) {
            setState(prev => ({
              ...prev,
              baseThemeName: theme.name,
            }));
            return;
          }
        } catch {
          // Ignore errors when detecting base theme
        }
      }
      setState(prev => ({
        ...prev,
        baseThemeName: undefined,
      }));
    };
    
    if (!state.isCustomTheme) {
      setState(prev => ({ ...prev, isCustomTheme: true }));
      detectBaseTheme();
    }
  }, [loadThemeCss, state.isCustomTheme]);

  // Reset to initial state
  const reset = useCallback(() => {
    setState({
      customCss: '',
      isCustomTheme: false,
      baseThemeName: undefined,
      isLoading: false,
      error: undefined,
    });
    initialLoadComplete.current = false;
  }, []);

  return {
    ...state,
    loadInitialTheme,
    handleThemeChange,
    handleCustomCssChange,
    reset,
  };
};
