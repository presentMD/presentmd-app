import { describe, it, expect } from 'vitest'
import {
  THEMES,
  THEME_DEFINITIONS,
  TIMEOUTS,
  THUMBNAIL_CONFIG,
  PRESENTATION_KEYS,
  PPTX_CONFIG,
  SECURITY,
  REGEX_PATTERNS,
} from '../index'

describe('THEMES', () => {
  it('contains default, space, and desert', () => {
    expect(THEMES).toContain('default')
    expect(THEMES).toContain('space')
    expect(THEMES).toContain('desert')
  })

  it('has exactly 3 themes', () => {
    expect(THEMES).toHaveLength(3)
  })
})

describe('THEME_DEFINITIONS', () => {
  it('has a definition for each theme', () => {
    expect(THEME_DEFINITIONS).toHaveLength(3)
  })

  it('each definition has a name and value', () => {
    for (const def of THEME_DEFINITIONS) {
      expect(typeof def.name).toBe('string')
      expect(typeof def.value).toBe('string')
    }
  })

  it('values match the THEMES tuple', () => {
    const values = THEME_DEFINITIONS.map(d => d.value)
    for (const theme of THEMES) {
      expect(values).toContain(theme)
    }
  })
})

describe('TIMEOUTS', () => {
  it('THUMBNAIL_SCROLL is a positive number', () => {
    expect(TIMEOUTS.THUMBNAIL_SCROLL).toBeGreaterThan(0)
  })
})

describe('THUMBNAIL_CONFIG', () => {
  it('has the expected keys with positive numeric values', () => {
    expect(THUMBNAIL_CONFIG.PER_PAGE).toBeGreaterThan(0)
    expect(THUMBNAIL_CONFIG.SCALE).toBeGreaterThan(0)
    expect(THUMBNAIL_CONFIG.WIDTH).toBeGreaterThan(0)
    expect(THUMBNAIL_CONFIG.HEIGHT).toBeGreaterThan(0)
  })
})

describe('PRESENTATION_KEYS', () => {
  it('NEXT includes ArrowRight and Space', () => {
    expect(PRESENTATION_KEYS.NEXT).toContain('ArrowRight')
    expect(PRESENTATION_KEYS.NEXT).toContain(' ')
  })

  it('PREV includes ArrowLeft', () => {
    expect(PRESENTATION_KEYS.PREV).toContain('ArrowLeft')
  })

  it('EXIT includes Escape', () => {
    expect(PRESENTATION_KEYS.EXIT).toContain('Escape')
  })

  it('FIRST includes Home', () => {
    expect(PRESENTATION_KEYS.FIRST).toContain('Home')
  })

  it('LAST includes End', () => {
    expect(PRESENTATION_KEYS.LAST).toContain('End')
  })
})

describe('PPTX_CONFIG', () => {
  it('LAYOUT dimensions are 16:9 aspect ratio', () => {
    const { width, height } = PPTX_CONFIG.LAYOUT
    expect(width / height).toBeCloseTo(16 / 9, 2)
  })

  it('FONTS have positive sizes', () => {
    expect(PPTX_CONFIG.FONTS.TITLE_SIZE).toBeGreaterThan(0)
    expect(PPTX_CONFIG.FONTS.TEXT_SIZE).toBeGreaterThan(0)
    expect(PPTX_CONFIG.FONTS.TITLE_SIZE_LARGE).toBeGreaterThan(0)
  })
})

describe('SECURITY', () => {
  it('ALLOWED_DOMAINS includes cdn.jsdelivr.net', () => {
    expect(SECURITY.ALLOWED_DOMAINS).toContain('cdn.jsdelivr.net')
  })

  it('MAX_PROMPT_LENGTH is a reasonable positive limit', () => {
    expect(SECURITY.MAX_PROMPT_LENGTH).toBeGreaterThan(0)
  })

  it('MAX_THEME_NAME_LENGTH is a reasonable positive limit', () => {
    expect(SECURITY.MAX_THEME_NAME_LENGTH).toBeGreaterThan(0)
  })
})

describe('REGEX_PATTERNS', () => {
  it('YAML_FRONTMATTER matches valid frontmatter', () => {
    const md = '---\ntitle: Hello\ntheme: space\n---\n# Content'
    expect(REGEX_PATTERNS.YAML_FRONTMATTER.test(md)).toBe(true)
  })

  it('SLIDE_SEPARATOR matches a --- separator line', () => {
    expect(REGEX_PATTERNS.SLIDE_SEPARATOR.test('---')).toBe(true)
  })

  it('HEADING matches markdown headings', () => {
    expect(REGEX_PATTERNS.HEADING.test('# My Slide')).toBe(true)
    expect(REGEX_PATTERNS.HEADING.test('## Section')).toBe(true)
  })

  it('FOOTER_DIRECTIVE matches footer comments', () => {
    const slide = '<!-- footer: "2026 | presentMD" -->'
    expect(REGEX_PATTERNS.FOOTER_DIRECTIVE.test(slide)).toBe(true)
  })

  it('HEADER_DIRECTIVE matches header comments', () => {
    const slide = '<!-- header: "My Header" -->'
    expect(REGEX_PATTERNS.HEADER_DIRECTIVE.test(slide)).toBe(true)
  })

  it('BACKGROUND_IMAGE matches bg syntax', () => {
    expect(REGEX_PATTERNS.BACKGROUND_IMAGE.test('![bg left](img.jpg)')).toBe(true)
    expect(REGEX_PATTERNS.BACKGROUND_IMAGE.test('![bg](photo.png)')).toBe(true)
  })

  it('CLASS_DIRECTIVE matches _class comments', () => {
    expect(REGEX_PATTERNS.CLASS_DIRECTIVE.test('<!-- _class: lead -->')).toBe(true)
  })
})
