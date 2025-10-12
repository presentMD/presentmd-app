// Theme constants
export const THEMES = ['default', 'space', 'desert'] as const;
export type Theme = typeof THEMES[number];

export const THEME_DEFINITIONS = [
  { name: "Default", value: "default" },
  { name: "Space", value: "space" },
  { name: "Desert", value: "desert" },
] as const;

// Timing constants
export const TIMEOUTS = {
  THEME_LOAD: 50,
  MOCK_API_RESPONSE: 1500,
  THUMBNAIL_SCROLL: 50,
} as const;

// UI constants
export const THUMBNAIL_CONFIG = {
  PER_PAGE: 4,
  SCALE: 0.25,
  WIDTH: 32,
  HEIGHT: 24,
} as const;

// Presentation mode constants
export const PRESENTATION_KEYS = {
  NEXT: ['ArrowRight', 'PageDown', ' '],
  PREV: ['ArrowLeft', 'PageUp', 'Backspace'],
  FIRST: ['Home'],
  LAST: ['End'],
  EXIT: ['Escape'],
} as const;

// PowerPoint export constants
export const PPTX_CONFIG = {
  LAYOUT: {
    name: 'LAYOUT_16x9',
    width: 10,
    height: 5.625,
  },
  FONTS: {
    TITLE_SIZE: 52,
    TEXT_SIZE: 24,
    TITLE_SIZE_LARGE: 64,
  },
  COLORS: {
    SHADOW: '000000',
    SHADOW_OPACITY: 0.3,
  },
  POSITIONS: {
    TITLE_X: 0.5,
    TITLE_Y_TITLE_SLIDE: 1.8,
    TITLE_Y_CONTENT: 0.5,
    CONTENT_X: 0.5,
    CONTENT_Y_WITH_TITLE: 2,
    CONTENT_Y_WITHOUT_TITLE: 1,
    SLIDE_NUMBER_X: 9.2,
    SLIDE_NUMBER_Y: 5.2,
  },
} as const;

// Security constants
export const SECURITY = {
  ALLOWED_DOMAINS: [
    'cdn.jsdelivr.net',
    'unpkg.com',
    'github.com',
    'raw.githubusercontent.com'
  ],
  MAX_PROMPT_LENGTH: 10000,
  MAX_THEME_NAME_LENGTH: 50,
} as const;

// CSS class constants
export const CSS_CLASSES = {
  PRESENTMD_SCOPE: 'presentmd-scope',
  PRESENTATION_MODE: 'presentation-mode',
  TITLE_SLIDE: 'title-slide',
  SECOND_SLIDE: 'second-slide',
  CUSTOM_COLOR_OVERRIDE: 'custom-color-override',
  CUSTOM_BG_OVERRIDE: 'custom-bg-override',
  BG_IMAGE_SLIDE: 'bg-image-slide',
  SPACE_THEME_SECTION: 'space-theme-section',
} as const;

// API constants
export const API = {
  ENDPOINTS: {
    GENERATE: '/api/generate',
  },
  MODELS: {
    GPT_3_5_TURBO: 'gpt-3.5-turbo',
    GPT_4: 'gpt-4',
  },
  DEFAULT_OPTIONS: {
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
  },
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'presentmd-theme',
  CUSTOM_CSS: 'presentmd-custom-css',
  LAST_THEME: 'presentmd-last-theme',
} as const;

// Regex patterns
export const REGEX_PATTERNS = {
  YAML_FRONTMATTER: /^---\s*\n([\s\S]*?)\n---\s*/m,
  SLIDE_SEPARATOR: /^---\s*$/m,
  HEADING: /^#+\s+(.+)$/m,
  FRONTMATTER_TITLE: /^title:\s*(.+)$/m,
  FRONTMATTER_THEME: /^theme:\s*(.+)$/m,
  HTML_COMMENT: /<!--\s*([\s\S]*?)\s*-->/,
  SPEAKER_NOTES: /<!--\s*([\s\S]*?)\s*-->|Notes:\s*(.*?)(?:\n\n|\n---|$)/s,
  FOOTER_DIRECTIVE: /<!--\s*footer:\s*["']?([^"']*)["']?\s*-->/i,
  HEADER_DIRECTIVE: /<!--\s*header:\s*["']?([^"']*)["']?\s*-->/i,
  COLOR_DIRECTIVE: /<!--\s*_color:\s*([^-\s][^>]*?)\s*-->/i,
  BACKGROUND_COLOR_DIRECTIVE: /<!--\s*_backgroundColor:\s*([^-\s][^>]*?)\s*-->/i,
  BACKGROUND_IMAGE: /!\[bg(?:\s+(left|right|fit|cover|contain))?\]\(([^)]+)\)/i,
  CLASS_DIRECTIVE: /<!--\s*_class:\s*([\s\S]*?)\s*-->/i,
  METADATA_PATTERN: /^(theme|title|class|paginate|marp|size|author|date|backgroundColor|backgroundImage|color|footer|header|style|transition|math|headingDivider|inlineSVG|html|layout|background|_class|_paginate|_size|_theme|_style|_transition|_math|_headingDivider|_inlineSVG|_html|_backgroundColor|_backgroundImage|_color|_footer|_header):\s*.*$/gm,
} as const;
