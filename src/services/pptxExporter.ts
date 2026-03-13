import PptxGenJS from "pptxgenjs";
import { handleExportError } from '@/lib/errorHandler';
import { PPTX_CONFIG } from '@/constants';
import { log } from '@/lib/logger';
import { getThemeConfig, ThemeConfig } from '@/config/themes';
import {
  parseSlides,
  extractFooterContent,
  extractColorDirective,
  extractBackgroundColorDirective,
  extractBackgroundImage,
  determineSlideClass,
} from '@/components/slides/utils';

// ─── helpers ──────────────────────────────────────────────────────────────────

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

// Common CSS named colors → 6-digit hex (no '#').
// PptxGenJS places color values directly in srgbClr/@val which must be hex.
const NAMED_COLOR_MAP: Record<string, string> = {
  white: 'FFFFFF', black: '000000', red: 'FF0000', green: '008000',
  blue: '0000FF', yellow: 'FFFF00', orange: 'FFA500', purple: '800080',
  pink: 'FFC0CB', aqua: '00FFFF', cyan: '00FFFF', teal: '008080',
  navy: '000080', gray: '808080', grey: '808080', silver: 'C0C0C0',
  gold: 'FFD700', lime: '00FF00', maroon: '800000', olive: '808000',
  coral: 'FF7F50', salmon: 'FA8072', brown: 'A52A2A',
  darkgray: 'A9A9A9', darkgrey: 'A9A9A9', lightgray: 'D3D3D3',
  lightgrey: 'D3D3D3', hotpink: 'FF69B4', indigo: '4B0082',
  violet: 'EE82EE', turquoise: '40E0D0', beige: 'F5F5DC',
  ivory: 'FFFFF0', lavender: 'E6E6FA', khaki: 'F0E68C',
};

/**
 * Convert any CSS color value to PptxGenJS-safe format:
 *   - hex '#rrggbb' or '#rgb' → strip '#', expand 3-char to 6-char
 *   - CSS named colors          → convert to 6-digit hex via lookup table
 *   - unknown strings           → return fallback
 */
const normalizeColor = (color: string | null | undefined, fallback: string): string => {
  if (!color) return fallback;
  const c = color.trim().toLowerCase();
  if (NAMED_COLOR_MAP[c]) return NAMED_COLOR_MAP[c];
  const raw = color.trim().replace('#', '');
  if (/^[0-9a-fA-F]{3}$/.test(raw))
    return raw.split('').map(h => h + h).join('').toUpperCase();
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return raw.toUpperCase();
  return fallback;
};

/**
 * Build an array of PptxGenJS TextProps runs from a single line of markdown text.
 * - Handles **bold**, *italic*, `code` spans, strips [link](url) to plain text
 * - paraOpts (bullet, indentLevel, paraSpaceAfter, …) go on the FIRST run
 * - '\n' is appended to the LAST run when endWithNewline is true
 */
const parseLineToRuns = (
  text: string,
  paraOpts: Record<string, unknown>,
  endWithNewline: boolean,
  color: string,
  font: string,
): PptxGenJS.TextProps[] => {
  const processed = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  const INLINE_RE = /(\*\*[^*\n]+?\*\*|\*(?!\*)[^*\n]+?\*|`[^`\n]+?`)/g;
  const segs: Array<{ text: string; bold?: boolean; italic?: boolean; code?: boolean }> = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = INLINE_RE.exec(processed)) !== null) {
    if (m.index > last) segs.push({ text: processed.slice(last, m.index) });
    const raw = m[1];
    if (raw.startsWith('**'))      segs.push({ text: raw.slice(2, -2), bold: true });
    else if (raw.startsWith('`')) segs.push({ text: raw.slice(1, -1), code: true });
    else                          segs.push({ text: raw.slice(1, -1), italic: true });
    last = m.index + raw.length;
  }
  if (last < processed.length) segs.push({ text: processed.slice(last) });

  if (segs.length === 0) {
    return [{ text: endWithNewline ? '\n' : ' ', options: { ...paraOpts, color, fontFace: font } as PptxGenJS.TextPropsOptions }];
  }

  return segs.map((seg, idx) => {
    const opts: Record<string, unknown> = { color, fontFace: font };
    if (idx === 0) Object.assign(opts, paraOpts);
    if (seg.bold)   opts.bold = true;
    if (seg.italic) opts.italic = true;
    if (seg.code)   opts.fontFace = 'Courier New';

    const runText = (endWithNewline && idx === segs.length - 1) ? seg.text + '\n' : seg.text;
    return { text: runText, options: opts as PptxGenJS.TextPropsOptions };
  });
};

// ─── types ────────────────────────────────────────────────────────────────────

type ContentLine =
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullet';    text: string; level: number }
  | { kind: 'numbered';  text: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'code';      text: string }
  | { kind: 'table';     headers: string[]; rows: string[][] };

interface SlideData {
  title: string;
  contentLines: ContentLine[];
  backgroundColor: string | null;
  textColor: string | null;
  bgImageUrl: string | null;
  bgImagePosition: string;
  footerText: string | null;
  isLeadSlide: boolean;
}

// ─── slide data parser ────────────────────────────────────────────────────────

const FRONTMATTER_KEY_RE =
  /^(theme|title|class|paginate|marp|size|author|date|backgroundColor|backgroundImage|color|footer|header|style|transition|math|headingDivider|inlineSVG|html|layout|background|_class|_paginate|_size|_theme|_style|_transition|_math|_headingDivider|_inlineSVG|_html|_backgroundColor|_backgroundImage|_color|_footer|_header):\s/;

const parseSlideData = (rawSlide: string, index: number): SlideData => {
  const backgroundColor = extractBackgroundColorDirective(rawSlide);
  const textColor       = extractColorDirective(rawSlide);
  const footerText      = extractFooterContent(rawSlide);
  const bgImage         = extractBackgroundImage(rawSlide);
  const slideClass      = determineSlideClass(rawSlide);

  const lines = rawSlide.split('\n');
  const contentLines: ContentLine[] = [];
  let title = '';

  // code block state
  let inCodeBlock = false;
  let codeLines: string[] = [];

  // table state
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  let tableSeparatorSeen = false;

  const flushTable = () => {
    if (inTable && tableHeaders.length > 0) {
      contentLines.push({ kind: 'table', headers: tableHeaders, rows: tableRows });
    }
    inTable = false;
    tableHeaders = [];
    tableRows = [];
    tableSeparatorSeen = false;
  };

  for (const rawLine of lines) {
    // ── code block fencing ────────────────────────────────────────────────────
    if (rawLine.trim().startsWith('```')) {
      if (inTable) flushTable();
      if (inCodeBlock) {
        inCodeBlock = false;
        if (codeLines.length > 0) {
          contentLines.push({ kind: 'code', text: codeLines.join('\n') });
          codeLines = [];
        }
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) { codeLines.push(rawLine); continue; }

    // Strip inline HTML comments, then trim
    const trimmed = rawLine.replace(/<!--.*?-->/gs, '').trim();

    // ── table rows ────────────────────────────────────────────────────────────
    // A table row starts and ends with '|'
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 1) {
      const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
      // Separator row: all cells are like '---', ':---', '---:', ':---:'
      const isSeparator = cells.every(c => /^:?-+:?$/.test(c));
      if (!inTable) {
        // Start of table – this is the header row
        inTable = true;
        tableSeparatorSeen = false;
        tableHeaders = cells;
        tableRows = [];
      } else if (!tableSeparatorSeen && isSeparator) {
        tableSeparatorSeen = true;
      } else if (!isSeparator) {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      // Non-table line encountered – flush pending table
      flushTable();
      // Fall through to process the current line as normal content
    }

    if (!trimmed)                          continue;
    if (trimmed.startsWith('<!--'))        continue;
    if (trimmed === '---')                 continue;
    if (FRONTMATTER_KEY_RE.test(trimmed))  continue;
    if (/^!\[bg/.test(trimmed))            continue;
    if (trimmed === '$$' || /^\$\$/.test(trimmed)) continue;
    // Skip raw HTML tags
    if (/^<\/?[a-zA-Z]/.test(trimmed))    continue;

    // ── headings ──────────────────────────────────────────────────────────────
    if (trimmed.startsWith('# ')) {
      const t = trimmed.slice(2).trim();
      if (!title) title = t; else contentLines.push({ kind: 'subheading', text: t });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      const t = trimmed.slice(3).trim();
      if (!title) title = t; else contentLines.push({ kind: 'subheading', text: t });
      continue;
    }
    if (/^#{3,}\s/.test(trimmed)) {
      const t = trimmed.replace(/^#{3,}\s+/, '');
      // Promote to title if none found yet
      if (!title) title = t; else contentLines.push({ kind: 'subheading', text: t });
      continue;
    }

    // ── list items ────────────────────────────────────────────────────────────
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const indentSpaces = rawLine.length - rawLine.trimStart().length;
      const level = Math.min(9, Math.floor(indentSpaces / 2)) as 0|1|2|3|4|5|6|7|8|9;
      contentLines.push({ kind: 'bullet', text: trimmed.slice(2).trim(), level });
      continue;
    }
    if (/^\d+\.\s/.test(trimmed)) {
      contentLines.push({ kind: 'numbered', text: trimmed.replace(/^\d+\.\s+/, '').trim() });
      continue;
    }

    contentLines.push({ kind: 'paragraph', text: trimmed });
  }

  // Flush any pending table or code block
  if (inTable) flushTable();
  if (inCodeBlock && codeLines.length > 0) {
    contentLines.push({ kind: 'code', text: codeLines.join('\n') });
  }

  const isLeadSlide = slideClass.includes('lead') || index === 0;

  return {
    title,
    contentLines,
    backgroundColor,
    textColor,
    bgImageUrl:      bgImage?.url      ?? null,
    bgImagePosition: bgImage?.position ?? 'cover',
    footerText,
    isLeadSlide,
  };
};

// ─── constants ────────────────────────────────────────────────────────────────

const SLIDE_W = PPTX_CONFIG.LAYOUT.width;
const SLIDE_H = PPTX_CONFIG.LAYOUT.height;
// Typical content-slide title size (much smaller than the lead-slide title)
const CONTENT_TITLE_SIZE = 28;
// Table theme colors
const TABLE_HEADER_FILL = 'E2E8F0';
const TABLE_BORDER_COLOR = 'CBD5E1';

// ─── slide builder ────────────────────────────────────────────────────────────

const addSlideToPresentation = async (
  pptx: PptxGenJS,
  rawSlide: string,
  index: number,
  themeConfig: ThemeConfig,
  backgroundImageData: string,
  titleBackgroundImageData: string,
): Promise<void> => {
  const slide = pptx.addSlide();
  const data = parseSlideData(rawSlide, index);

  // ── Background ───────────────────────────────────────────────────────────────
  let bgImgData = data.isLeadSlide ? titleBackgroundImageData : backgroundImageData;
  if (data.bgImageUrl) {
    bgImgData = await getImageAsBase64(data.bgImageUrl);
  }

  // Compute layout offsets for split-image slides (![bg left] / ![bg right])
  let contentX = 0.5;
  let contentW = SLIDE_W - 1;
  const isSplitLeft  = bgImgData && data.bgImagePosition === 'left';
  const isSplitRight = bgImgData && data.bgImagePosition === 'right';

  if (data.backgroundColor) {
    // Per-slide solid color override
    slide.background = { color: normalizeColor(data.backgroundColor, 'FFFFFF'), type: 'solid' } as PptxGenJS.BackgroundProps;
  } else if (bgImgData) {
    if (isSplitLeft) {
      // Solid theme color on right; image occupies left half via addImage
      slide.background = { color: normalizeColor(themeConfig.background.color, 'FFFFFF'), type: 'solid' } as PptxGenJS.BackgroundProps;
      slide.addImage({
        data: bgImgData, x: 0, y: 0,
        w: SLIDE_W / 2, h: SLIDE_H,
        sizing: { type: 'cover', w: SLIDE_W / 2, h: SLIDE_H },
      });
      contentX = SLIDE_W / 2 + 0.15;
      contentW = SLIDE_W / 2 - 0.65;
    } else if (isSplitRight) {
      // Solid theme color on left; image occupies right half via addImage
      slide.background = { color: normalizeColor(themeConfig.background.color, 'FFFFFF'), type: 'solid' } as PptxGenJS.BackgroundProps;
      slide.addImage({
        data: bgImgData, x: SLIDE_W / 2, y: 0,
        w: SLIDE_W / 2, h: SLIDE_H,
        sizing: { type: 'cover', w: SLIDE_W / 2, h: SLIDE_H },
      });
      contentW = SLIDE_W / 2 - 0.65;
    } else {
      // Full-slide background: use proper PPTX background element (avoids z-order issues
      // where addImage floats above text boxes)
      slide.background = { data: bgImgData } as PptxGenJS.BackgroundProps;
    }
  } else if (themeConfig.gradient) {
    slide.background = themeConfig.gradient as unknown as PptxGenJS.BackgroundProps;
  } else {
    slide.background = {
      color: normalizeColor(themeConfig.background.color, 'FFFFFF'),
      type: 'solid',
    } as PptxGenJS.BackgroundProps;
  }

  // ── Resolved colors ──────────────────────────────────────────────────────────
  const perSlideColor = data.textColor ? normalizeColor(data.textColor, '') : null;
  const titleColor = perSlideColor || normalizeColor(themeConfig.titleColor, '1F3864');
  const textColor  = perSlideColor || normalizeColor(themeConfig.textColor,  '242424');
  const font       = themeConfig.textFontFamily;
  const titleFont  = themeConfig.titleFontFamily;
  const fontSize   = themeConfig.textFontSize;

  // ── Title text box ───────────────────────────────────────────────────────────
  const titleY = data.isLeadSlide
    ? PPTX_CONFIG.POSITIONS.TITLE_Y_TITLE_SLIDE
    : PPTX_CONFIG.POSITIONS.TITLE_Y_CONTENT;
  const titleH = data.isLeadSlide ? 1.5 : 0.8;
  const titleSize = data.isLeadSlide ? themeConfig.titleFontSize : CONTENT_TITLE_SIZE;

  if (data.title) {
    slide.addText(data.title, {
      x: contentX,
      y: titleY,
      w: contentW,
      h: titleH,
      fontSize: titleSize,
      bold:     themeConfig.titleStyle.bold,
      italic:   themeConfig.titleStyle.italic,
      color:    titleColor,
      fontFace: titleFont,
      align:    data.isLeadSlide ? 'center' : 'left',
      valign:   data.isLeadSlide ? 'middle' : 'top',
      shadow: {
        type: 'outer', angle: 45, blur: 2,
        color: PPTX_CONFIG.COLORS.SHADOW, offset: 1,
        opacity: PPTX_CONFIG.COLORS.SHADOW_OPACITY,
      },
    });
  }

  // ── Layout: split contentLines into text-runs and tables ─────────────────────
  const textLines  = data.contentLines.filter(l => l.kind !== 'table');
  const tableDefs  = data.contentLines.filter(l => l.kind === 'table') as
    Extract<ContentLine, { kind: 'table' }>[];

  const footerReserve = data.footerText ? 0.5 : 0.35;
  const contentY = data.title ? titleY + titleH + 0.1 : 0.5;
  const totalContentH = Math.max(0.5, SLIDE_H - contentY - footerReserve);

  // Allocate vertical space
  let textBoxH  = totalContentH;
  let tableStartY = contentY;

  if (textLines.length > 0 && tableDefs.length > 0) {
    // Rough estimate: allow up to 40% for text, rest for table
    textBoxH    = Math.min(totalContentH * 0.4, textLines.length * 0.32);
    tableStartY = contentY + textBoxH + 0.1;
  } else if (tableDefs.length > 0 && textLines.length === 0) {
    textBoxH    = 0;
    tableStartY = contentY;
  }

  // Dynamic font size: estimate line count; shrink font if content would overflow
  let effectiveFontSize = fontSize;
  if (textLines.length > 0 && textBoxH > 0) {
    const estLines = textLines.reduce((acc, line) => {
      if (line.kind === 'code') return acc + line.text.split('\n').length + 0.5;
      if (line.kind === 'subheading') return acc + 1.5;
      // Rough chars-per-line at current font size and box width
      const charsPerLine = Math.max(20, Math.floor(contentW * 96 / (fontSize * 0.55)));
      const text = 'text' in line ? line.text : '';
      return acc + Math.max(1, Math.ceil(text.length / charsPerLine));
    }, 0);
    const lineH = fontSize / 72 * 1.6; // inches per line
    const maxFit = textBoxH / lineH;
    if (estLines > maxFit) {
      effectiveFontSize = Math.max(8, Math.floor(fontSize * maxFit / estLines));
    }
  }

  // ── Content text box ─────────────────────────────────────────────────────────
  if (textLines.length > 0) {
    const runs: PptxGenJS.TextProps[] = [];

    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      const addNewline = i < textLines.length - 1;

      switch (line.kind) {
        case 'paragraph':
          runs.push(...parseLineToRuns(
            line.text, { paraSpaceAfter: 6 }, addNewline, textColor, font));
          break;

        case 'bullet':
          runs.push(...parseLineToRuns(
            line.text,
            { bullet: true, indentLevel: line.level, paraSpaceAfter: 4 },
            addNewline, textColor, font));
          break;

        case 'numbered':
          runs.push(...parseLineToRuns(
            line.text,
            { bullet: { type: 'number' }, paraSpaceAfter: 4 },
            addNewline, textColor, font));
          break;

        case 'subheading':
          runs.push({
            text: addNewline ? line.text + '\n' : line.text,
            options: {
              bold: true, fontSize: effectiveFontSize + 2,
              color: titleColor, fontFace: titleFont,
              paraSpaceBefore: 8, paraSpaceAfter: 4,
            } as PptxGenJS.TextPropsOptions,
          });
          break;

        case 'code': {
          // Split multi-line code into per-line runs so newlines render correctly
          const codeLineTexts = line.text.split('\n');
          codeLineTexts.forEach((codeLine, ci) => {
            const isLastLine = ci === codeLineTexts.length - 1;
            const needsNewline = !isLastLine || addNewline;
            runs.push({
              text: needsNewline ? codeLine + '\n' : codeLine,
              options: {
                fontFace: 'Courier New',
                fontSize: Math.max(8, effectiveFontSize - 6),
                color: textColor,
                paraSpaceBefore: ci === 0 ? 4 : 0,
                paraSpaceAfter:  isLastLine ? 8 : 0,
              } as PptxGenJS.TextPropsOptions,
            });
          });
          break;
        }
      }
    }

    if (runs.length > 0) {
      slide.addText(runs, {
        x: contentX,
        y: contentY,
        w: contentW,
        h: textBoxH,
        fontSize:            effectiveFontSize,
        color:               textColor,
        fontFace:            font,
        align:               data.isLeadSlide ? 'center' : 'left',
        valign:              'top',
        lineSpacingMultiple: 1.2,
        fit:                 'shrink',
      });
    }
  }

  // ── Tables ────────────────────────────────────────────────────────────────────
  if (tableDefs.length > 0) {
    const tableH = Math.max(0.5, SLIDE_H - tableStartY - footerReserve);
    const perTableH = tableH / tableDefs.length;

    tableDefs.forEach((tbl, ti) => {
      const tblY = tableStartY + ti * perTableH;
      const colW = contentW / Math.max(1, tbl.headers.length);

      const headerRow: PptxGenJS.TableCell[] = tbl.headers.map(h => ({
        text: h,
        options: {
          bold:  true,
          color: titleColor,
          fontFace: titleFont,
          fontSize: fontSize - 2,
          fill:  { color: TABLE_HEADER_FILL },
          align: 'center' as const,
        },
      }));

      const dataRows: PptxGenJS.TableCell[][] = tbl.rows.map(row =>
        row.map(cell => ({
          text: cell,
          options: {
            color: textColor,
            fontFace: font,
            fontSize: fontSize - 2,
          },
        }))
      );

      const allRows = tbl.headers.length > 0 ? [headerRow, ...dataRows] : dataRows;

      slide.addTable(allRows, {
        x: contentX, y: tblY,
        w: contentW, colW: Array(tbl.headers.length).fill(colW),
        border: { pt: 0.5, color: TABLE_BORDER_COLOR },
        fontFace: font,
        fontSize: fontSize - 2,
        color:    textColor,
      });
    });
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  if (data.footerText) {
    slide.addText(data.footerText, {
      x: contentX, y: SLIDE_H - 0.4, w: contentW - 0.5, h: 0.3,
      fontSize: 10, italic: true, color: textColor, fontFace: font,
      align: 'left', valign: 'bottom',
    });
  }

  // ── Slide number ─────────────────────────────────────────────────────────────
  if (index > 0) {
    slide.addText(`${index}`, {
      x: SLIDE_W - 1, y: SLIDE_H - 0.4, w: 0.4, h: 0.3,
      fontSize: 10, color: textColor, fontFace: font,
      align: 'right', valign: 'bottom',
    });
  }
};

// ─── public API ───────────────────────────────────────────────────────────────

export const exportToPowerPoint = async (
  markdown: string,
  theme: string,
  onProgress?: (message: string) => void,
): Promise<void> => {
  const startTime = Date.now();
  const slides = parseSlides(markdown);

  try {
    log.exportStart('PowerPoint', slides.length);
    onProgress?.('Preparing Export');
    onProgress?.('Loading theme assets and generating PowerPoint...');

    const pptx = new PptxGenJS();
    const themeConfig = getThemeConfig(theme);

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

    pptx.defineLayout(PPTX_CONFIG.LAYOUT);
    pptx.layout = PPTX_CONFIG.LAYOUT.name;

    for (let i = 0; i < slides.length; i++) {
      await addSlideToPresentation(
        pptx, slides[i], i, themeConfig,
        backgroundImageData, titleBackgroundImageData,
      );
    }

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
