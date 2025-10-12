
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';
import { extractFooterContent, extractHeaderContent, cleanSlideContent, extractBackgroundImage, extractColorDirective, extractBackgroundColorDirective } from './utils';
import { getSlideThemeConfig } from '@/config/themes';


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
    { className: cn(base, levels[level as keyof typeof levels], getSlideThemeConfig(theme).heading) },
    children
  );
};

const SlideParagraph = ({ children, theme }: { children: React.ReactNode; theme: string }) => (
  <p className={getSlideThemeConfig(theme).paragraph}>{children}</p>
);

const SlideList = ({ ordered, children, theme }: { ordered: boolean; children: React.ReactNode; theme: string }) => {
  const ListTag = ordered ? 'ol' : 'ul';
  return React.createElement(
    ListTag,
    { className: getSlideThemeConfig(theme).list },
    children
  );
};

const SlideListItem = ({ children, theme }: { children: React.ReactNode; theme: string }) => (
  <li className={getSlideThemeConfig(theme).listItem}>{children}</li>
);

const SlideCode = ({ inline, children, theme }: { inline?: boolean; children: React.ReactNode; theme: string }) =>
  inline ? (
    <code className={getSlideThemeConfig(theme).code}>{children}</code>
  ) : (
    <pre className={getSlideThemeConfig(theme).pre}>
      <code>{children}</code>
    </pre>
  );

const SlideBlockquote = ({ children, theme }: { children: React.ReactNode; theme: string }) => (
  <blockquote className={getSlideThemeConfig(theme).blockquote}>{children}</blockquote>
);

export default function SlideRenderer({ content, className = '', theme = defaultTheme }: { content: string; className?: string; theme?: string }) {
  // Fallback to default if theme is unknown
  const t = theme;
  
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
  const customColor = extractColorDirective(content);
  const customBackgroundColor = extractBackgroundColorDirective(content);
  
  
  // Clean the content for rendering
  const cleanedContent = cleanSlideContent(content);
  
  const rootClass = cn(
    getSlideThemeConfig(t).root, 
    className?.includes('presentation-mode') ? "p-16 flex flex-col justify-center h-full w-full" : "p-8 flex flex-col justify-center h-full w-full",
    shouldLoadSpaceTheme && "space-theme-section",
    backgroundImage && "bg-image-slide",
    customColor && "custom-color-override",
    customBackgroundColor && "custom-bg-override",
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

  // Generate custom color styles using CSS custom properties
  const customColorStyle = customColor
    ? { '--custom-text-color': customColor } as React.CSSProperties
    : {};

  // Generate custom background color styles using CSS custom properties
  const customBackgroundColorStyle = customBackgroundColor
    ? { '--custom-bg-color': customBackgroundColor } as React.CSSProperties
    : {};


  return (
    <section 
      className={rootClass}
      style={{...backgroundImageStyle, ...customColorStyle, ...customBackgroundColorStyle}}
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
      {(customColor || customBackgroundColor) && (
        <style>
          {`
            .custom-color-override {
              color: var(--custom-text-color) !important;
            }
            .custom-bg-override {
              background-color: var(--custom-bg-color) !important;
            }
            .custom-color-override * {
              color: var(--custom-text-color) !important;
            }
          `}
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
            code: ({ inline, children, ...props }: { inline?: boolean; children: React.ReactNode; [key: string]: unknown }) => <SlideCode inline={inline} theme={t}>{children}</SlideCode>,
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
