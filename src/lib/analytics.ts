// Analytics utility for presentMD
// This file provides a centralized way to track user interactions and app usage

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Check if Google Analytics is available
const isGAAvailable = () => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Track page views
export const trackPageView = (pageName: string, pageTitle?: string) => {
  if (!isGAAvailable()) return;
  
  window.gtag('event', 'page_view', {
    page_title: pageTitle || pageName,
    page_location: window.location.href,
    page_path: window.location.pathname,
  });
};

// Track presentation exports
export const trackPresentationExport = (theme: string, slideCount: number) => {
  if (!isGAAvailable()) return;
  
  window.gtag('event', 'presentation_export', {
    event_category: 'engagement',
    event_label: theme,
    value: slideCount,
    custom_parameters: {
      theme: theme,
      slide_count: slideCount,
    },
  });
};

// Track theme changes
export const trackThemeChange = (theme: string, themeType: 'slide' | 'mode') => {
  if (!isGAAvailable()) return;
  
  window.gtag('event', 'theme_change', {
    event_category: 'customization',
    event_label: `${themeType}_${theme}`,
    custom_parameters: {
      theme: theme,
      theme_type: themeType,
    },
  });
};

// Track presentation mode usage
export const trackPresentationMode = (action: 'start' | 'end', slideCount: number) => {
  if (!isGAAvailable()) return;
  
  window.gtag('event', 'presentation_mode', {
    event_category: 'engagement',
    event_label: action,
    value: slideCount,
    custom_parameters: {
      action: action,
      slide_count: slideCount,
    },
  });
};

// Track custom CSS usage
export const trackCustomCSS = (action: 'enable' | 'disable' | 'save') => {
  if (!isGAAvailable()) return;
  
  window.gtag('event', 'custom_css', {
    event_category: 'customization',
    event_label: action,
  });
};

// Track help dialog usage
export const trackHelpDialog = (action: 'open' | 'close') => {
  if (!isGAAvailable()) return;
  
  window.gtag('event', 'help_dialog', {
    event_category: 'engagement',
    event_label: action,
  });
};

// Track slide navigation
export const trackSlideNavigation = (direction: 'next' | 'previous' | 'jump', slideIndex: number) => {
  if (!isGAAvailable()) return;
  
  window.gtag('event', 'slide_navigation', {
    event_category: 'engagement',
    event_label: direction,
    value: slideIndex,
    custom_parameters: {
      direction: direction,
      slide_index: slideIndex,
    },
  });
};

// Track app errors
export const trackError = (errorType: string, errorMessage: string, context?: string) => {
  if (!isGAAvailable()) return;
  
  window.gtag('event', 'exception', {
    description: `${errorType}: ${errorMessage}`,
    fatal: false,
    custom_parameters: {
      error_type: errorType,
      error_message: errorMessage,
      context: context || 'unknown',
    },
  });
};

// Track user engagement time
export const trackEngagementTime = (timeSpent: number, page: string) => {
  if (!isGAAvailable()) return;
  
  window.gtag('event', 'engagement_time', {
    event_category: 'engagement',
    event_label: page,
    value: Math.round(timeSpent),
    custom_parameters: {
      time_spent_seconds: timeSpent,
      page: page,
    },
  });
};

// Track feature usage
export const trackFeatureUsage = (feature: string, action: string) => {
  if (!isGAAvailable()) return;
  
  window.gtag('event', 'feature_usage', {
    event_category: 'features',
    event_label: `${feature}_${action}`,
    custom_parameters: {
      feature: feature,
      action: action,
    },
  });
};
