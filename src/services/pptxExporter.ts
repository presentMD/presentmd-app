import PptxGenJS from "pptxgenjs";
import { handleExportError } from '@/lib/errorHandler';
import { PPTX_CONFIG } from '@/constants';
import { log } from '@/lib/logger';
import { getThemeConfig, ThemeConfig } from '@/config/themes';


// Helper function to convert image URL to base64 data
const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    log.error('Error loading image', error);
    return '';
  }
};

// Parse slide content for PowerPoint
const parseSlideContent = (slideContent: string, isTitleSlide: boolean) => {
  const lines = slideContent.trim().split('\n').filter(line => line.trim());
  let title = '';
  const content: string[] = [];
  const bulletPoints: string[] = [];
  
  for (const line of lines) {
    // Skip frontmatter
    if (line.startsWith('title:') || line.startsWith('marp:') || line.startsWith('theme:') || line.startsWith('paginate:') || line.startsWith('author:')) {
      continue;
    }
    
    if (line.startsWith('# ')) {
      title = line.replace('# ', '');
    } else if (line.startsWith('## ')) {
      title = line.replace('## ', '');
    } else if (line.startsWith('### ')) {
      title = line.replace('### ', '');
    } else if (line.startsWith('- ')) {
      bulletPoints.push(line.replace('- ', '• '));
    } else if (line.startsWith('* ')) {
      bulletPoints.push(line.replace('* ', '• '));
    } else if (line.trim() && !line.startsWith('<!--')) {
      // Skip HTML comments
      content.push(line);
    }
  }
  
  return { title, content, bulletPoints };
};

// Add slide to presentation
const addSlideToPresentation = (
  pptx: PptxGenJS,
  slideContent: string,
  index: number,
  themeConfig: ThemeConfig,
  backgroundImageData: string,
  titleBackgroundImageData: string
) => {
  const slide = pptx.addSlide();
  const isTitleSlide = index === 0 || slideContent.includes('title:');
  const { title, content, bulletPoints } = parseSlideContent(slideContent, isTitleSlide);
  
  // Set slide background
  if (backgroundImageData && !isTitleSlide) {
    // Use background image for content slides
    slide.background = {
      type: 'solid',
      color: themeConfig.background.color
    };
    // Add background image as a shape
    slide.addImage({
      data: backgroundImageData,
      x: 0,
      y: 0,
      w: PPTX_CONFIG.LAYOUT.width,
      h: PPTX_CONFIG.LAYOUT.height,
      sizing: { type: 'cover', w: PPTX_CONFIG.LAYOUT.width, h: PPTX_CONFIG.LAYOUT.height }
    });
  } else if (titleBackgroundImageData && isTitleSlide) {
    // Use title background image for title slides
    slide.background = {
      type: 'solid',
      color: themeConfig.background.color
    };
    // Add background image as a shape
    slide.addImage({
      data: titleBackgroundImageData,
      x: 0,
      y: 0,
      w: PPTX_CONFIG.LAYOUT.width,
      h: PPTX_CONFIG.LAYOUT.height,
      sizing: { type: 'cover', w: PPTX_CONFIG.LAYOUT.width, h: PPTX_CONFIG.LAYOUT.height }
    });
  } else if (themeConfig.gradient) {
    // Use gradient background
    slide.background = themeConfig.gradient;
  } else {
    // Use solid color background
    slide.background = themeConfig.background;
  }
  
  // Combine content and bullet points
  const allContent = [...content, ...bulletPoints];
  
  // Add title if present
  if (title) {
    slide.addText(title, {
      x: PPTX_CONFIG.POSITIONS.TITLE_X,
      y: isTitleSlide ? PPTX_CONFIG.POSITIONS.TITLE_Y_TITLE_SLIDE : PPTX_CONFIG.POSITIONS.TITLE_Y_CONTENT,
      w: PPTX_CONFIG.LAYOUT.width - 1,
      h: isTitleSlide ? 1.5 : 1,
      fontSize: isTitleSlide ? themeConfig.titleFontSize + 12 : themeConfig.titleFontSize,
      bold: themeConfig.titleStyle.bold,
      italic: themeConfig.titleStyle.italic,
      color: themeConfig.titleColor,
      fontFace: themeConfig.titleFontFamily,
      align: isTitleSlide ? 'center' : 'left',
      valign: isTitleSlide ? 'middle' : 'top',
      shadow: {
        type: 'outer',
        angle: 45,
        blur: 2,
        color: PPTX_CONFIG.COLORS.SHADOW,
        offset: 1,
        opacity: PPTX_CONFIG.COLORS.SHADOW_OPACITY
      }
    });
  }
  
  // Add content
  if (allContent.length > 0) {
    // Process content to handle basic markdown formatting
    const processedContent = allContent.map(line => {
      // Handle bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '$1');
      // Handle italic text
      line = line.replace(/\*(.*?)\*/g, '$1');
      // Handle links (remove markdown syntax)
      line = line.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      return line;
    }).join('\n');

    slide.addText(processedContent, {
      x: PPTX_CONFIG.POSITIONS.CONTENT_X,
      y: title ? (isTitleSlide ? 3.8 : PPTX_CONFIG.POSITIONS.CONTENT_Y_WITH_TITLE) : (isTitleSlide ? 2.5 : PPTX_CONFIG.POSITIONS.CONTENT_Y_WITHOUT_TITLE),
      w: PPTX_CONFIG.LAYOUT.width - 1,
      h: title ? (isTitleSlide ? 1.2 : 3) : (isTitleSlide ? 2.5 : 4),
      fontSize: themeConfig.textFontSize,
      bold: themeConfig.textStyle.bold,
      italic: themeConfig.textStyle.italic,
      color: themeConfig.textColor,
      fontFace: themeConfig.textFontFamily,
      align: isTitleSlide ? 'center' : 'left',
      valign: 'top',
      lineSpacing: 1.3,
      bullet: bulletPoints.length > 0 ? true : false
    });
  }
  
  // Add slide number if not first slide
  if (index > 0) {
    slide.addText(`${index}`, {
      x: PPTX_CONFIG.POSITIONS.SLIDE_NUMBER_X,
      y: PPTX_CONFIG.POSITIONS.SLIDE_NUMBER_Y,
      w: 0.5,
      h: 0.3,
      fontSize: 14,
      color: themeConfig.textColor,
      fontFace: themeConfig.textFontFamily,
      align: 'right',
      valign: 'bottom'
    });
  }
};

// Main export function
export const exportToPowerPoint = async (
  markdown: string,
  theme: string,
  onProgress?: (message: string) => void
): Promise<void> => {
  const startTime = Date.now();
  const slides = markdown.split(/^---\s*$/m).map(slide => slide.trim()).filter(slide => slide.length > 0);
  
  try {
    log.exportStart('PowerPoint', slides.length);
    onProgress?.("Preparing Export");
    onProgress?.("Loading theme assets and generating PowerPoint...");

    const pptx = new PptxGenJS();
    const themeConfig = getThemeConfig(theme);
    
    // Load background images as base64
    let backgroundImageData = '';
    let titleBackgroundImageData = '';
    
    try {
      if (themeConfig.backgroundImage) {
        backgroundImageData = await getImageAsBase64(themeConfig.backgroundImage);
      }
      if (themeConfig.titleBackgroundImage) {
        titleBackgroundImageData = await getImageAsBase64(themeConfig.titleBackgroundImage);
      }
    } catch (error) {
      log.warn('Could not load background images, using solid colors instead', error);
    }
    
    // Set presentation properties
    pptx.defineLayout(PPTX_CONFIG.LAYOUT);
    pptx.layout = PPTX_CONFIG.LAYOUT.name;
    
    slides.forEach((slideContent, index) => {
      addSlideToPresentation(
        pptx,
        slideContent,
        index,
        themeConfig,
        backgroundImageData,
        titleBackgroundImageData
      );
    });
    
    // Generate and download
    await pptx.writeFile({ fileName: `presentation-${theme}.pptx` });
    
    const duration = Date.now() - startTime;
    log.exportComplete('PowerPoint', duration);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    log.exportError('PowerPoint', error instanceof Error ? error.message : 'Unknown error');
    handleExportError(error);
    throw error;
  }
};
