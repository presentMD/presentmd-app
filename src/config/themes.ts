import { PPTX_CONFIG } from '@/constants';

export interface ThemeConfig {
  background: { type: string; color: string };
  backgroundImage?: string;
  titleBackgroundImage?: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  titleFontFamily: string;
  textFontFamily: string;
  titleFontSize: number;
  textFontSize: number;
  titleStyle: { bold: boolean; italic: boolean };
  textStyle: { bold: boolean; italic: boolean };
  overlay?: {
    type: string;
    color: string;
    transparency: number;
  };
  gradient?: {
    type: string;
    angle: number;
    stops: Array<{ position: number; color: string }>;
  };
}

// Theme configurations for PowerPoint export
export const THEME_CONFIGS: Record<string, ThemeConfig> = {
  space: {
    background: { type: 'solid', color: '#110e3b' },
    backgroundImage: '/images/NASA-main_image_star-forming_region_carina_nircam_final-5mb.jpeg',
    titleBackgroundImage: '/images/NASA-cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L3BkMzYtMS1nc2ZjXzIwMTcxMjA4X2FyY2hpdmVfZTAwMjA3Ni5qcGc.png',
    titleColor: '#ffacfc',
    textColor: '#ffffff',
    accentColor: '#5c34d6',
    fontFamily: 'Orbitron',
    titleFontFamily: 'Orbitron',
    textFontFamily: 'Roboto',
    titleFontSize: PPTX_CONFIG.FONTS.TITLE_SIZE,
    textFontSize: PPTX_CONFIG.FONTS.TEXT_SIZE,
    titleStyle: { bold: true, italic: false },
    textStyle: { bold: false, italic: false },
    overlay: {
      type: 'solid',
      color: '#110e3b',
      transparency: 60
    }
  },
  desert: {
    background: { type: 'solid', color: '#f7e3da' },
    backgroundImage: '/images/keith-hardy-PP8Escz15d8-unsplash.jpg',
    titleBackgroundImage: '/images/wiki-commons-caravan-in-the-desert.jpg',
    titleColor: '#8b4513',
    textColor: '#5e2c38',
    accentColor: '#c29240',
    fontFamily: 'Montserrat',
    titleFontFamily: 'Montserrat',
    textFontFamily: 'Roboto',
    titleFontSize: PPTX_CONFIG.FONTS.TITLE_SIZE,
    textFontSize: PPTX_CONFIG.FONTS.TEXT_SIZE,
    titleStyle: { bold: true, italic: false },
    textStyle: { bold: false, italic: false },
    overlay: {
      type: 'solid',
      color: '#f7e3da',
      transparency: 40
    }
  },
  default: {
    background: { type: 'solid', color: '#ffffff' },
    backgroundImage: undefined,
    titleBackgroundImage: undefined,
    titleColor: '#246',
    textColor: '#222',
    accentColor: '#48c',
    fontFamily: 'Red Hat Display',
    titleFontFamily: 'Red Hat Display',
    textFontFamily: 'Red Hat Display',
    titleFontSize: PPTX_CONFIG.FONTS.TITLE_SIZE,
    textFontSize: PPTX_CONFIG.FONTS.TEXT_SIZE,
    titleStyle: { bold: true, italic: false },
    textStyle: { bold: false, italic: false },
    gradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { position: 0, color: '#ffffff' },
        { position: 100, color: '#f8fafc' }
      ]
    }
  }
};

// Theme configurations for slide rendering
export const SLIDE_THEME_CONFIGS = {
  space: {
    root: 'text-white font-sans px-8 py-8 relative min-h-full',
    heading: 'font-bold text-[#ffacfc] font-orbitron tracking-wide drop-shadow-md mb-3 mt-0',
    paragraph: 'text-base leading-normal mb-3 mt-0 text-shadow',
    code: 'bg-[#1e1e3c] text-[#fffb80] px-[0.3em] py-[0.1em] rounded font-mono text-sm shadow align-middle',
    pre: 'bg-[#1e1e3c]/80 rounded-md p-3 mb-4 text-[#fffc] font-mono overflow-x-auto shadow',
    blockquote: 'border-l-4 border-[#5c34d6] bg-[#20134a]/60 pl-4 pr-2 py-2 italic mb-3 mt-3 text-base',
    list: 'list-disc list-inside text-base mb-2 pl-6',
    listItem: 'mb-1',
    link: 'underline text-[#aee1fa] hover:text-[#52d3fa]',
    strong: 'font-black text-[#ffe059]',
    em: 'italic text-[#c2c6ff]',
    hr: 'my-4 border-t border-[#483890]',
    table: 'border border-[#402080] rounded-lg text-base mb-4',
    th: 'bg-[#220d50] text-[#ffacfc] font-bold px-3 py-1 border-b border-[#40105e]',
    td: 'bg-[#150933] px-3 py-1 border-b border-[#2d1853]',
    pagination: 'text-[#a0a9d6]/80 font-orbitron text-sm pt-2'
  },
  desert: {
    root: 'text-espresso font-sans px-8 py-8 relative min-h-full bg-[--dune]',
    heading: 'font-bold text-terracotta',
    paragraph: 'text-base leading-normal mb-3',
    code: 'bg-[#c29240]/10 text-[#5e2c38] px-[0.3em] py-[0.1em] rounded font-mono text-sm',
    pre: 'bg-[#f7e3da]/80 rounded-md p-3 mb-4 text-[#5e2c38] font-mono overflow-x-auto',
    blockquote: 'border-l-4 border-[#c99997] bg-[#fff4] pl-4 pr-2 py-2 italic mb-3 mt-3 text-base',
    list: 'list-disc list-inside text-base mb-2 pl-6',
    listItem: 'mb-1',
    link: 'underline text-[#c29240] hover:text-[#9f811f]',
  },
  default: {
    root: 'bg-white text-black font-sans',
    heading: 'font-semibold text-black',
    paragraph: 'text-lg mb-5 text-black',
    code: 'bg-gray-100 text-black px-2 py-1 rounded font-mono',
    pre: 'bg-gray-50 rounded-lg p-4 mb-6 font-mono',
    blockquote: 'border-l-4 border-gray-300 bg-gray-50 pl-6 italic my-6 text-base md:text-lg text-black',
    list: 'list-disc pl-6 text-base text-black',
    listItem: 'mb-1 text-black',
    link: 'text-blue-600 hover:text-blue-800 underline',
  },
};

export const getThemeConfig = (theme: string): ThemeConfig => {
  return THEME_CONFIGS[theme] || THEME_CONFIGS.default;
};

export const getSlideThemeConfig = (theme: string) => {
  return SLIDE_THEME_CONFIGS[theme] || SLIDE_THEME_CONFIGS.default;
};
