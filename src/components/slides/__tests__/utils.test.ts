import { describe, it, expect } from 'vitest'
import {
  parseSlides,
  extractSlideTitles,
  extractTheme,
  extractSpeakerNotes,
  extractFooterContent,
  extractHeaderContent,
  extractColorDirective,
  extractBackgroundColorDirective,
  extractBackgroundImage,
  cleanSlideContent,
  determineSlideClass,
} from '../utils'

describe('Slide Utils', () => {
  describe('parseSlides', () => {
    it('should split markdown into slides', () => {
      const markdown = `# Slide 1
Content 1

---

# Slide 2
Content 2`
      
      const slides = parseSlides(markdown)
      expect(slides).toHaveLength(2)
      expect(slides[0]).toContain('Slide 1')
      expect(slides[1]).toContain('Slide 2')
    })

    it('should handle empty markdown', () => {
      const slides = parseSlides('')
      expect(slides).toEqual([''])
    })

    it('should handle markdown without separators', () => {
      const markdown = `# Single Slide
Content here`
      
      const slides = parseSlides(markdown)
      expect(slides).toHaveLength(1)
      expect(slides[0]).toContain('Single Slide')
    })

    it('should remove YAML frontmatter', () => {
      const markdown = `---
title: My Presentation
theme: default
---

# Slide 1
Content`
      
      const slides = parseSlides(markdown)
      expect(slides[0]).not.toContain('title: My Presentation')
      expect(slides[0]).toContain('Slide 1')
    })

    it('should handle persistent header and footer', () => {
      const markdown = `<!-- header: "My Header" -->
# Slide 1

---

# Slide 2
Content

<!-- footer: "My Footer" -->

---

# Slide 3
More content`
      
      const slides = parseSlides(markdown)
      expect(slides[0]).toContain('header: "My Header"')
      expect(slides[1]).toContain('header: "My Header"')
      expect(slides[1]).toContain('footer: "My Footer"')
      expect(slides[2]).toContain('header: "My Header"')
      expect(slides[2]).toContain('footer: "My Footer"')
    })
  })

  describe('extractSlideTitles', () => {
    it('should extract titles from headings', () => {
      const slides = [
        '# Main Title',
        '## Subtitle',
        'Content without heading'
      ]
      
      const titles = extractSlideTitles(slides)
      expect(titles[0]).toBe('Main Title')
      expect(titles[1]).toBe('Subtitle')
      expect(titles[2]).toBe('Slide 3')
    })

    it('should extract titles from frontmatter', () => {
      const slides = [
        'title: Frontmatter Title\nContent here'
      ]
      
      const titles = extractSlideTitles(slides)
      expect(titles[0]).toBe('Frontmatter Title')
    })
  })

  describe('extractTheme', () => {
    it('should extract theme from frontmatter', () => {
      const markdown = `---
theme: space
---

# Content`
      
      const theme = extractTheme(markdown)
      expect(theme).toBe('space')
    })

    it('should return default when no theme found', () => {
      const markdown = `# Content`
      
      const theme = extractTheme(markdown)
      expect(theme).toBe('default')
    })
  })

  describe('extractSpeakerNotes', () => {
    it('should extract notes from HTML comments', () => {
      const slideContent = `# Slide Title
Content here

<!-- This is a speaker note -->`
      
      const notes = extractSpeakerNotes(slideContent)
      expect(notes).toBe('This is a speaker note')
    })

    it('should extract notes from Notes: sections', () => {
      const slideContent = `# Slide Title
Content here

Notes: This is a speaker note`
      
      const notes = extractSpeakerNotes(slideContent)
      expect(notes).toBe('This is a speaker note')
    })

    it('should return empty string when no notes found', () => {
      const slideContent = `# Slide Title
Content here`
      
      const notes = extractSpeakerNotes(slideContent)
      expect(notes).toBe('')
    })
  })

  describe('extractFooterContent', () => {
    it('should extract footer directive', () => {
      const slideContent = `# Slide Title
Content

<!-- footer: "2025 | presentMD.com" -->`
      
      const footer = extractFooterContent(slideContent)
      expect(footer).toBe('2025 | presentMD.com')
    })

    it('should return null when no footer found', () => {
      const slideContent = `# Slide Title
Content`
      
      const footer = extractFooterContent(slideContent)
      expect(footer).toBeNull()
    })
  })

  describe('extractHeaderContent', () => {
    it('should extract header directive', () => {
      const slideContent = `<!-- header: "My Header" -->
# Slide Title
Content`
      
      const header = extractHeaderContent(slideContent)
      expect(header).toBe('My Header')
    })

    it('should return null when no header found', () => {
      const slideContent = `# Slide Title
Content`
      
      const header = extractHeaderContent(slideContent)
      expect(header).toBeNull()
    })
  })

  describe('extractColorDirective', () => {
    it('should extract color directive', () => {
      const slideContent = `<!-- _color: red -->
# Slide Title`
      
      const color = extractColorDirective(slideContent)
      expect(color).toBe('red')
    })

    it('should return null when no color directive found', () => {
      const slideContent = `# Slide Title`
      
      const color = extractColorDirective(slideContent)
      expect(color).toBeNull()
    })
  })

  describe('extractBackgroundColorDirective', () => {
    it('should extract background color directive', () => {
      const slideContent = `<!-- _backgroundColor: blue -->
# Slide Title`
      
      const bgColor = extractBackgroundColorDirective(slideContent)
      expect(bgColor).toBe('blue')
    })

    it('should return null when no background color directive found', () => {
      const slideContent = `# Slide Title`
      
      const bgColor = extractBackgroundColorDirective(slideContent)
      expect(bgColor).toBeNull()
    })
  })

  describe('extractBackgroundImage', () => {
    it('should extract background image with position', () => {
      const slideContent = `![bg left](image.jpg)
# Slide Title`
      
      const bgImage = extractBackgroundImage(slideContent)
      expect(bgImage).toEqual({
        url: 'image.jpg',
        position: 'left'
      })
    })

    it('should extract background image without position', () => {
      const slideContent = `![bg](image.jpg)
# Slide Title`
      
      const bgImage = extractBackgroundImage(slideContent)
      expect(bgImage).toEqual({
        url: 'image.jpg',
        position: 'cover'
      })
    })

    it('should return null when no background image found', () => {
      const slideContent = `# Slide Title`
      
      const bgImage = extractBackgroundImage(slideContent)
      expect(bgImage).toBeNull()
    })
  })

  describe('cleanSlideContent', () => {
    it('should remove frontmatter', () => {
      const slideContent = `title: My Title
# Slide Title
Content`
      
      const cleaned = cleanSlideContent(slideContent)
      expect(cleaned).not.toContain('title: My Title')
      expect(cleaned).toContain('Slide Title')
    })

    it('should remove HTML comments except _class directives', () => {
      const slideContent = `<!-- _class: lead -->
# Slide Title
<!-- This is a comment -->
Content`
      
      const cleaned = cleanSlideContent(slideContent)
      expect(cleaned).toContain('_class: lead')
      expect(cleaned).not.toContain('This is a comment')
    })

    it('should remove background image syntax', () => {
      const slideContent = `![bg](image.jpg)
# Slide Title
Content`
      
      const cleaned = cleanSlideContent(slideContent)
      expect(cleaned).not.toContain('![bg](image.jpg)')
      expect(cleaned).toContain('Slide Title')
    })

    it('should remove Notes sections', () => {
      const slideContent = `# Slide Title
Content

Notes: This is a note`
      
      const cleaned = cleanSlideContent(slideContent)
      expect(cleaned).not.toContain('Notes: This is a note')
    })
  })

  describe('determineSlideClass', () => {
    it('should return title-slide for h1', () => {
      const slideContent = `# Main Title
Content`
      
      const className = determineSlideClass(slideContent)
      expect(className).toBe('title-slide')
    })

    it('should return second-slide for h2', () => {
      const slideContent = `## Subtitle
Content`
      
      const className = determineSlideClass(slideContent)
      expect(className).toBe('second-slide')
    })

    it('should return empty string for other headings', () => {
      const slideContent = `### Section
Content`
      
      const className = determineSlideClass(slideContent)
      expect(className).toBe('')
    })

    it('should prioritize explicit _class directive', () => {
      const slideContent = `<!-- _class: custom-slide -->
# Main Title
Content`
      
      const className = determineSlideClass(slideContent)
      expect(className).toBe('custom-slide')
    })

    it('should return empty string when no heading found', () => {
      const slideContent = `Content without heading`
      
      const className = determineSlideClass(slideContent)
      expect(className).toBe('')
    })
  })
})
