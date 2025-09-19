// Check if a slide contains only metadata (no actual content)
function isMetadataOnlySlide(slide: string): boolean {
  if (!slide.trim()) return true;

  // Remove all metadata lines
  const withoutMetadata = slide.replace(/^(theme|title|class|paginate|marp|size|author|date|backgroundColor|backgroundImage|color|footer|header|style|transition|math|headingDivider|inlineSVG|html):\s*.*$/gm, '');

  // Remove YAML frontmatter blocks
  const withoutYaml = withoutMetadata.replace(/^---\s*[\s\S]*?---\s*/m, '');

  // Check if anything meaningful remains
  return withoutYaml.trim().length === 0;
}

// Parse markdown content into individual slides
export function parseSlides(markdown: string): string[] {
  if (!markdown.trim()) return [''];

  // Split on slide separators (---)
  const slides = markdown.split(/^---\s*$/m).map(slide => slide.trim());

  // Skip first slide if it contains only metadata
  if (slides.length > 0 && isMetadataOnlySlide(slides[0])) {
    slides.shift();
  }

  // Second slide may also have only meta data so repeat:
  if (slides.length > 0 && isMetadataOnlySlide(slides[0])) {
    slides.shift();
  }

  // Clean up each slide content and remove empties
  return slides.map(slide => slide.trim()).filter(slide => slide.length > 0);
}

// Extract slide titles from markdown content
export function extractSlideTitles(slides: string[]): string[] {
  return slides.map((slide, index) => {
    // Look for the first heading in the slide
    const headingMatch = slide.match(/^#+\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }

    // Look for frontmatter title
    const titleMatch = slide.match(/^title:\s*["']?([^"'\n]+)["']?$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    // Fallback to slide number
    return `Slide ${index + 1}`;
  });
}

// Extract theme from markdown frontmatter
export function extractTheme(markdown: string): string {
  const themeMatch = markdown.match(/^theme:\s*["']?([^"'\n]+)["']?$/m);
  return themeMatch ? themeMatch[1].trim() : 'default';
}

// Extract speaker notes from markdown comments
export function extractSpeakerNotes(slide: string): string[] {
  const notes: string[] = [];
  const commentMatches = slide.matchAll(/<!--\s*(.*?)\s*-->/gs);
  
  for (const match of commentMatches) {
    const note = match[1].trim();
    if (note && !note.startsWith('_class:')) {
      notes.push(note);
    }
  }
  
  return notes;
}

// Clean slide content by removing comments and metadata
export function cleanSlideContent(slide: string): string {
  return slide
    // Remove HTML comments (speaker notes)
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove metadata lines
    .replace(/^(theme|title|class|paginate|marp|size|author|date|backgroundColor|backgroundImage|color|footer|header|style|transition|math|headingDivider|inlineSVG|html):\s*.*$/gm, '')
    .trim();
}

// Determine slide class from comments
export function determineSlideClass(slide: string): string {
  const classMatch = slide.match(/<!--\s*_class:\s*([^-]+)\s*-->/);
  return classMatch ? classMatch[1].trim() : '';
}