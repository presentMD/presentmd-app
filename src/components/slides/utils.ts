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
  // Skip first slide if it contains only metadata
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
    const frontmatterMatch = slide.match(/^title:\s*(.+)$/m);
    if (frontmatterMatch) {
      return frontmatterMatch[1].replace(/['"]/g, '').trim();
    }
    
    // Fallback to slide number
    return `Slide ${index + 1}`;
  });
}

// Extract theme from markdown frontmatter
export function extractTheme(markdown: string): string {
  const themeMatch = markdown.match(/^theme:\s*(.+)$/m);
  return themeMatch ? themeMatch[1].replace(/['"]/g, '').trim() : 'default';
}

// Extract speaker notes from slide content
export function extractSpeakerNotes(slideContent: string): string {
  // Look for HTML comments or "Notes:" sections
  const notesMatch = slideContent.match(/<!--\s*([\s\S]*?)\s*-->|Notes:\s*(.*?)(?:\n\n|\n---|$)/s);
  return notesMatch ? (notesMatch[1] || notesMatch[2] || '').trim() : '';
}

// Clean slide content by removing frontmatter and speaker notes
export function cleanSlideContent(slideContent: string): string {
  let cleaned = slideContent;
  
  // Remove frontmatter (lines starting with key:)
  cleaned = cleaned.replace(/^(theme|title|class|paginate|marp|size|author|date):\s*.*$/gm, '');
  
  // Preserve _class directives while removing other HTML comments
  cleaned = cleaned.replace(/<!--\s*_class:\s*(.*?)\s*-->/g, (match, className) => {
    return `<div class="${className}"></div>`;
  });

  // Remove other HTML comments
  cleaned = cleaned.replace(/<!--(?!\s*_class:).*?-->/gs, '');
  
  // Remove "Notes:" sections
  cleaned = cleaned.replace(/Notes:\s*.*?(?=\n\n|\n---|$)/gs, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  
  return cleaned;
}

// Determine a CSS class for a slide based on its first heading.
// - h1 => 'title-slide'
// - h2 => 'second-slide'
// Returns an empty string when no heading is found or no class should be applied.
export function determineSlideClass(slideContent: string): string {
  if (!slideContent) return '';

  // Prefer explicit _class directives in HTML comments: <!-- _class: my-class other -->
  const classDirective = slideContent.match(/<!--\s*_class:\s*([\s\S]*?)\s*-->/i);
  if (classDirective && classDirective[1]) {
    // Normalize whitespace and return as class string
    return classDirective[1].trim().split(/\s+/).join(' ');
  }

  // Fallback: determine from first heading (# => title-slide, ## => second-slide)
  const match = slideContent.match(/^\s*(#{1,6})\s+(.+)$/m);
  if (!match) return '';
  const hashes = match[1];
  if (hashes.length === 1) return 'title-slide';
  if (hashes.length === 2) return 'second-slide';
  return '';
}