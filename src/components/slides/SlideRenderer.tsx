
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';
import { extractFooterContent, extractHeaderContent, cleanSlideContent, extractBackgroundImage } from './utils';

// Theme configs. Add more themes as desired!
const themeConfigs = {
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

const defaultTheme = 'default';

// MARK: heading component
const SlideHeading = ({ level, children, theme }: { level: number; children: React.ReactNode; theme: string }) => {
  const base = 'mb-4 leading-tight';
  const levels = {
    1: 'text-4xl md:text-5xl lg:text-6xl mb-8',
    2: 'text-3xl md:text-4xl lg:text-5xl mb-6',
    3: 'text-2xl md:text-3xl lg:text-4xl mb-4',
    4: 'text-xl md:text-2xl lg:text-3xl mb-4',
    5: 'text-lg md:text-xl lg:text-2xl mb-3',
    6: 'text-base md:text-lg lg:text-xl mb-3',
  };
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  return React.createElement(
    HeadingTag,
    { className: cn(base, levels[level as keyof typeof levels], themeConfigs[theme]?.heading || themeConfigs[defaultTheme].heading) },
    children
  );
};

const SlideParagraph = ({ children, theme }: { children: React.ReactNode; theme: string }) => (
  <p className={themeConfigs[theme]?.paragraph || themeConfigs[defaultTheme].paragraph}>{children}</p>
);

const SlideList = ({ ordered, children, theme }: { ordered: boolean; children: React.ReactNode; theme: string }) => {
  const ListTag = ordered ? 'ol' : 'ul';
  return React.createElement(
    ListTag,
    { className: themeConfigs[theme]?.list || themeConfigs[defaultTheme].list },
    children
  );
};

const SlideListItem = ({ children, theme }: { children: React.ReactNode; theme: string }) => (
  <li className={themeConfigs[theme]?.listItem || themeConfigs[defaultTheme].listItem}>{children}</li>
);

const SlideCode = ({ inline, children, theme }: { inline?: boolean; children: React.ReactNode; theme: string }) =>
  inline ? (
    <code className={themeConfigs[theme]?.code || themeConfigs[defaultTheme].code}>{children}</code>
  ) : (
    <pre className={themeConfigs[theme]?.pre || themeConfigs[defaultTheme].pre}>
      <code>{children}</code>
    </pre>
  );

const SlideBlockquote = ({ children, theme }: { children: React.ReactNode; theme: string }) => (
  <blockquote className={themeConfigs[theme]?.blockquote || themeConfigs[defaultTheme].blockquote}>{children}</blockquote>
);

export default function SlideRenderer({ content, className = '', theme = defaultTheme }: { content: string; className?: string; theme?: string }) {
  // Fallback to default if theme is unknown
  const t = themeConfigs[theme] ? theme : defaultTheme;
  
  // Load CSS theme file for space theme
  const shouldLoadSpaceTheme = t === 'space';
  
  // Determine viewing mode based on className
  const isThumbnail = className?.includes('thumbnail') || className?.includes('scale');
  const isPresentation = className?.includes('presentation-mode');
  const isPreview = !isThumbnail && !isPresentation;
  
  // Extract footer and header content from the original content (before cleaning)
  const footerContent = extractFooterContent(content);
  const headerContent = extractHeaderContent(content);
  const backgroundImage = extractBackgroundImage(content);
  
  // Clean the content for rendering
  const cleanedContent = cleanSlideContent(content);
  
  const rootClass = cn(
    themeConfigs[t].root, 
    className?.includes('presentation-mode') ? "p-16 flex flex-col justify-center h-full w-full" : "p-8 flex flex-col justify-center h-full w-full",
    shouldLoadSpaceTheme && "space-theme-section",
    backgroundImage && "bg-image-slide",
    className
  );

  // Generate background image styles
  const backgroundImageStyle = backgroundImage ? {
    ...(backgroundImage.position === 'left' && {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'stretch',
      position: 'relative' as const
    }),
    ...(backgroundImage.position === 'right' && {
      display: 'flex',
      flexDirection: 'row-reverse' as const,
      alignItems: 'stretch',
      position: 'relative' as const
    }),
    ...(backgroundImage.position !== 'left' && backgroundImage.position !== 'right' && {
      backgroundImage: `url(${backgroundImage.url})`,
      backgroundSize: backgroundImage.position === 'fit' ? 'contain' : 
                     backgroundImage.position === 'cover' ? 'cover' :
                     backgroundImage.position === 'contain' ? 'contain' : 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    })
  } : {};

  return (
    <section 
      className={rootClass}
      style={backgroundImageStyle}
      data-marp-theme={shouldLoadSpaceTheme ? 'space' : undefined}
      data-thumbnail={isThumbnail ? 'true' : undefined}
      data-preview={isPreview ? 'true' : undefined}
      data-presentation={isPresentation ? 'true' : undefined}
      data-footer={footerContent ? 'true' : undefined}
      data-header={headerContent ? 'true' : undefined}
      data-bg-image={backgroundImage ? 'true' : undefined}
      data-bg-position={backgroundImage?.position || undefined}
    >
      {shouldLoadSpaceTheme && (
        <style>
          {`@import url('/themes/space.css');`}
        </style>
      )}
      {headerContent && (
        <header style={{ 
          position: 'absolute', 
          top: '21px', 
          left: '30px', 
          color: 'rgba(102, 102, 102, 0.75)', 
          fontSize: '18px', 
          margin: 0,
          zIndex: 10
        }}>
          {headerContent}
        </header>
      )}
      
      {/* Background image for split layouts */}
      {backgroundImage && (backgroundImage.position === 'left' || backgroundImage.position === 'right') && (
        <div 
          className="absolute inset-0 w-1/2"
          style={{
            backgroundImage: `url(${backgroundImage.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            left: backgroundImage.position === 'left' ? '0' : 'auto',
            right: backgroundImage.position === 'right' ? '0' : 'auto',
            zIndex: 1,
            top: 0,
            bottom: 0
          }}
          onError={(e) => {
            console.warn('Failed to load background image:', backgroundImage.url);
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      
      {/* Content wrapper for split layouts */}
      <div 
        className={cn(
          backgroundImage && (backgroundImage.position === 'left' || backgroundImage.position === 'right') 
            ? "flex-1 flex flex-col justify-center p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg relative z-10" 
            : "flex-1 flex flex-col justify-center"
        )}
        style={{
          ...(backgroundImage && (backgroundImage.position === 'left' || backgroundImage.position === 'right') && {
            maxWidth: '50%',
            marginLeft: backgroundImage.position === 'left' ? 'auto' : '0',
            marginRight: backgroundImage.position === 'right' ? 'auto' : '0',
            marginTop: '2rem',
            marginBottom: '2rem'
          })
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: ({ children }) => <SlideHeading level={1} theme={t}>{children}</SlideHeading>,
            h2: ({ children }) => <SlideHeading level={2} theme={t}>{children}</SlideHeading>,
            h3: ({ children }) => <SlideHeading level={3} theme={t}>{children}</SlideHeading>,
            h4: ({ children }) => <SlideHeading level={4} theme={t}>{children}</SlideHeading>,
            h5: ({ children }) => <SlideHeading level={5} theme={t}>{children}</SlideHeading>,
            h6: ({ children }) => <SlideHeading level={6} theme={t}>{children}</SlideHeading>,
            p: ({ children }) => <SlideParagraph theme={t}>{children}</SlideParagraph>,
            ul: ({ children }) => <SlideList ordered={false} theme={t}>{children}</SlideList>,
            ol: ({ children }) => <SlideList ordered={true} theme={t}>{children}</SlideList>,
            li: ({ children }) => <SlideListItem theme={t}>{children}</SlideListItem>,
            code: ({ inline, children, ...props }: any) => <SlideCode inline={inline} theme={t}>{children}</SlideCode>,
            blockquote: ({ children }) => <SlideBlockquote theme={t}>{children}</SlideBlockquote>,
          }}
        >
          {cleanedContent}
        </ReactMarkdown>
      </div>
      {footerContent && (
        <footer style={{ 
          position: 'absolute', 
          bottom: '21px', 
          left: '30px', 
          color: 'rgba(102, 102, 102, 0.75)', 
          fontSize: '18px', 
          margin: 0,
          zIndex: 10
        }}>
          {footerContent}
        </footer>
      )}
    </section>
  );
}
