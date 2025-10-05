// Check if a slide contains only metadata (no actual content)
function isMetadataOnlySlide(slide: string): boolean {
  if (!slide.trim()) return true;
  
  // Remove all metadata lines (expanded list) - using a more efficient approach
  const metadataPattern = /^(theme|title|class|paginate|marp|size|author|date|backgroundColor|backgroundImage|color|footer|header|style|transition|math|headingDivider|inlineSVG|html|layout|background|_class|_paginate|_size|_theme|_style|_transition|_math|_headingDivider|_inlineSVG|_html|_backgroundColor|_backgroundImage|_color|_footer|_header):\s*.*$/gm;
  const withoutMetadata = slide.replace(metadataPattern, '');
  
  // Remove YAML frontmatter blocks
  const withoutYaml = withoutMetadata.replace(/^---\s*[\s\S]*?---\s*/m, '');
  
  // Remove HTML comments that might contain metadata
  const withoutComments = withoutYaml.replace(/<!--\s*[^>]*?-->/gs, '');
  
  // Check if anything meaningful remains
  return withoutComments.trim().length === 0;
}

// Parse markdown content into individual slides, ignoring all metadata
export function parseSlides(markdown: string): string[] {
  if (!markdown.trim()) return [''];
  
  // First, check if there's actual YAML frontmatter (must have key: value pairs)
  // Only remove if it looks like real YAML frontmatter, not just slide separators
  let cleanedMarkdown = markdown;
  const yamlMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*/m);
  if (yamlMatch && yamlMatch[1].trim()) {
    // Check if the content between --- markers looks like YAML (has key: value pairs)
    const yamlContent = yamlMatch[1].trim();
    const hasYamlKeys = /^(theme|title|class|paginate|marp|size|author|date|backgroundColor|backgroundImage|color|footer|header|style|transition|math|headingDivider|inlineSVG|html|layout|background):\s*.*$/m.test(yamlContent);
    
    if (hasYamlKeys) {
      // Only remove if it's actual YAML frontmatter
      cleanedMarkdown = markdown.replace(/^---\s*[\s\S]*?---\s*/m, '');
    }
  }
  
  // If markdown starts with --- but it's not YAML frontmatter, treat it as a slide separator
  if (cleanedMarkdown.startsWith('---') && (!yamlMatch || !yamlMatch[1].trim().match(/^(theme|title|class|paginate|marp|size|author|date|backgroundColor|backgroundImage|color|footer|header|style|transition|math|headingDivider|inlineSVG|html|layout|background):\s*.*$/m))) {
    cleanedMarkdown = cleanedMarkdown.replace(/^---\s*/, '');
  }
  
  // Split on slide separators (---)
  const slides = cleanedMarkdown.split(/^---\s*$/m).map(slide => slide.trim());

  // Remove any slides that contain only metadata
  const contentSlides = slides.filter(slide => !isMetadataOnlySlide(slide));

  // If no content slides remain, return a default empty slide
  if (contentSlides.length === 0) {
    return [''];
  }

  // Process slides to add persistent header/footer content
  let persistentHeader: string | null = null;
  let persistentFooter: string | null = null;
  
  const processedSlides = contentSlides.map(slide => {
    // Check for header directive in this slide
    const headerMatch = slide.match(/<!--\s*header:\s*["']?([^"']*)["']?\s*-->/i);
    if (headerMatch) {
      const headerContent = headerMatch[1].trim();
      if (headerContent === '') {
        // Empty header directive clears the persistent header
        persistentHeader = null;
      } else {
        // Set new persistent header
        persistentHeader = headerContent;
      }
    }
    
    // Check for footer directive in this slide
    const footerMatch = slide.match(/<!--\s*footer:\s*["']?([^"']*)["']?\s*-->/i);
    if (footerMatch) {
      const footerContent = footerMatch[1].trim();
      if (footerContent === '') {
        // Empty footer directive clears the persistent footer
        persistentFooter = null;
      } else {
        // Set new persistent footer
        persistentFooter = footerContent;
      }
    }
    
    // Add persistent header/footer to slide content if they exist
    let enhancedSlide = slide;
    if (persistentHeader && !slide.includes('<!-- header:')) {
      enhancedSlide = `<!-- header: "${persistentHeader}" -->\n${enhancedSlide}`;
    }
    if (persistentFooter && !slide.includes('<!-- footer:')) {
      enhancedSlide = `${enhancedSlide}\n<!-- footer: "${persistentFooter}" -->`;
    }
    
    return enhancedSlide;
  });

  // Clean up each slide content and remove empties
  return processedSlides.map(slide => slide.trim()).filter(slide => slide.length > 0);
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

// Extract footer content from slide
export function extractFooterContent(slideContent: string): string | null {
  const footerMatch = slideContent.match(/<!--\s*footer:\s*["']?([^"']*)["']?\s*-->/i);
  return footerMatch ? footerMatch[1].trim() : null;
}

// Extract header content from slide
export function extractHeaderContent(slideContent: string): string | null {
  const headerMatch = slideContent.match(/<!--\s*header:\s*["']?([^"']*)["']?\s*-->/i);
  return headerMatch ? headerMatch[1].trim() : null;
}

// Extract color directive from slide
export function extractColorDirective(slideContent: string): string | null {
  const colorMatch = slideContent.match(/<!--\s*_color:\s*([^-\s][^>]*?)\s*-->/i);
  return colorMatch ? colorMatch[1].trim() : null;
}

// Extract backgroundColor directive from slide
export function extractBackgroundColorDirective(slideContent: string): string | null {
  const backgroundColorMatch = slideContent.match(/<!--\s*_backgroundColor:\s*([^-\s][^>]*?)\s*-->/i);
  return backgroundColorMatch ? backgroundColorMatch[1].trim() : null;
}

// Extract background image information from slide content
export function extractBackgroundImage(slideContent: string): { url: string; position: string } | null {
  // Look for ![bg left](url) or ![bg right](url) or ![bg](url) patterns
  const bgMatch = slideContent.match(/!\[bg(?:\s+(left|right|fit|cover|contain))?\]\(([^)]+)\)/i);
  if (bgMatch) {
    const url = bgMatch[2].trim();
    const position = bgMatch[1]?.trim() || 'cover';
    
    // Basic URL validation
    if (url && (url.startsWith('http') || url.startsWith('/') || url.startsWith('./') || url.startsWith('../'))) {
      return { url, position };
    }
  }
  return null;
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

  // Remove other HTML comments (including footer and header comments)
  cleaned = cleaned.replace(/<!--(?!\s*_class:).*?-->/gs, '');
  
  // Remove background image syntax (used for styling, not content)
  cleaned = cleaned.replace(/!\[bg(?:\s+(left|right|fit|cover|contain))?\]\([^)]+\)/gi, '');
  
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