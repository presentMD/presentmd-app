import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

// Theme configs. Add more themes as desired!
const themeConfigs = {
  dracula: {
    root: 'bg-gradient-to-br from-[#282a36] to-[#44475a] text-[#f8f8f2] font-sans',
    heading: 'font-bold text-pink-400',
    paragraph: 'text-lg mb-5',
    code: 'bg-[#44475a] text-yellow-300 px-2 py-1 rounded',
    pre: 'bg-[#44475a] rounded-lg p-4 mb-6 text-yellow-200',
    blockquote: 'border-l-4 border-pink-400 bg-[#343746] pl-6 italic my-6 text-base md:text-lg',
    list: 'list-disc pl-6 text-base',
    listItem: 'mb-1',
  },
  gaia: {
    root: 'bg-gradient-to-br from-green-50 to-emerald-100 text-emerald-800 font-sans',
    heading: 'font-bold text-emerald-600',
    paragraph: 'text-lg mb-5',
    code: 'bg-emerald-100 text-green-900 px-2 py-1 rounded',
    pre: 'bg-emerald-100 rounded-lg p-4 mb-6',
    blockquote: 'border-l-4 border-emerald-400 bg-green-50 pl-6 italic my-6 text-base md:text-lg',
    list: 'list-disc pl-6 text-base',
    listItem: 'mb-1',
  },
  uncover: {
    root: 'bg-gradient-to-br from-slate-100 to-zinc-200 text-zinc-900 font-sans',
    heading: 'font-bold text-sky-700',
    paragraph: 'text-lg mb-5',
    code: 'bg-slate-200 text-sky-800 px-2 py-1 rounded',
    pre: 'bg-slate-200 rounded-lg p-4 mb-6',
    blockquote: 'border-l-4 border-sky-400 bg-blue-50 pl-6 italic my-6 text-base md:text-lg',
    list: 'list-disc pl-6 text-base',
    listItem: 'mb-1',
  },
  space: {
    root: 'text-white font-sans px-8 py-8 relative min-h-full',
    heading: 'font-bold text-[#ffacfc] font-orbitron tracking-wide drop-shadow-md mb-3 mt-0',
    paragraph: 'text-lg mb-5 text-white/90',
    code: 'bg-white/10 text-[#00d9ff] px-2 py-1 rounded backdrop-blur-sm',
    pre: 'bg-white/10 rounded-lg p-4 mb-6 backdrop-blur-sm',
    blockquote: 'border-l-4 border-[#ffacfc] bg-white/5 pl-6 italic my-6 text-base md:text-lg backdrop-blur-sm',
    list: 'list-disc pl-6 text-base text-white/90',
    listItem: 'mb-1',
  },
  desert: {
    root: 'bg-gradient-to-br from-amber-50 to-orange-100 text-amber-900 font-sans',
    heading: 'font-bold text-orange-700',
    paragraph: 'text-lg mb-5',
    code: 'bg-orange-100 text-amber-800 px-2 py-1 rounded',
    pre: 'bg-orange-100 rounded-lg p-4 mb-6',
    blockquote: 'border-l-4 border-orange-400 bg-amber-50 pl-6 italic my-6 text-base md:text-lg',
    list: 'list-disc pl-6 text-base',
    listItem: 'mb-1',
  },
  default: {
    root: 'bg-gradient-to-br from-white to-gray-50 text-gray-900 font-sans',
    heading: 'font-bold text-gray-800',
    paragraph: 'text-lg mb-5',
    code: 'bg-gray-100 text-gray-800 px-2 py-1 rounded',
    pre: 'bg-gray-100 rounded-lg p-4 mb-6',
    blockquote: 'border-l-4 border-gray-400 bg-gray-50 pl-6 italic my-6 text-base md:text-lg',
    list: 'list-disc pl-6 text-base',
    listItem: 'mb-1',
  },
};

interface SlideRendererProps {
  markdown: string;
  theme?: string;
  customCss?: string;
  className?: string;
}

export default function SlideRenderer({ 
  markdown, 
  theme = 'default', 
  customCss, 
  className 
}: SlideRendererProps) {
  // Get theme configuration
  const themeKey = theme as keyof typeof themeConfigs;
  const config = themeConfigs[themeKey] || themeConfigs.default;

  // Apply space theme background for space theme
  const backgroundStyle = theme === 'space' ? {
    backgroundImage: `
      radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
      radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px),
      radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 40px),
      radial-gradient(rgba(255,255,255,.4), rgba(255,255,255,.1) 2px, transparent 30px)
    `,
    backgroundSize: '550px 550px, 350px 350px, 250px 250px, 150px 150px',
    backgroundPosition: '0 0, 40px 60px, 130px 270px, 70px 100px',
    backgroundColor: '#0a0a0a'
  } : {};

  return (
    <>
      {customCss && (
        <style dangerouslySetInnerHTML={{ __html: customCss }} />
      )}
      <div 
        className={cn(
          'slide-container h-full w-full flex flex-col justify-center items-center p-8',
          config.root,
          className
        )}
        style={backgroundStyle}
      >
        <div className="slide-content max-w-4xl w-full">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className={cn(config.heading, 'text-4xl md:text-6xl mb-6 text-center')}>
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className={cn(config.heading, 'text-3xl md:text-5xl mb-4')}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className={cn(config.heading, 'text-2xl md:text-4xl mb-3')}>
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className={cn(config.heading, 'text-xl md:text-3xl mb-2')}>
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className={config.paragraph}>{children}</p>
              ),
              ul: ({ children }) => (
                <ul className={config.list}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className={cn(config.list, 'list-decimal')}>{children}</ol>
              ),
              li: ({ children }) => (
                <li className={config.listItem}>{children}</li>
              ),
              code: ({ children }) => (
                <code className={config.code}>{children}</code>
              ),
              pre: ({ children }) => (
                <pre className={config.pre}>{children}</pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className={config.blockquote}>{children}</blockquote>
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </>
  );
}