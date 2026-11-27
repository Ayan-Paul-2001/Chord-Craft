'use client';

import React from 'react';
import { CmsFontKey } from '@/lib/types';
import { getCmsFontClass, isValidCmsFont } from '@/lib/cmsFonts';

/**
 * Safely parses lightweight CMS inline formatting into pure React elements
 * (zero dangerouslySetInnerHTML / zero XSS surface).
 *
 * Supported syntax (nestable):
 *   - **bold**
 *   - *italic*
 *   - __underline__
 *   - ==gold highlight==
 *   - [font:playfair]styled text[/font]
 */
function parseInlineNodes(text: string, keyPrefix = 'n', depth = 0): React.ReactNode[] {
  if (!text) return [];
  if (depth > 8) return [text];

  const nodes: React.ReactNode[] = [];
  // Order matters: longest / most specific delimiters first
  const tokenRegex =
    /(\[font:([a-z-]+)\]([\s\S]*?)\[\/font\]|\*\*(?=\S)([\s\S]*?\S)\*\*|__(?=\S)([\s\S]*?\S)__|==(?=\S)([\s\S]*?\S)==|\*(?=\S)([^*\n]*?\S)\*)/i;

  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    const match = tokenRegex.exec(remaining);
    if (!match) {
      nodes.push(remaining);
      break;
    }

    if (match.index > 0) {
      nodes.push(remaining.slice(0, match.index));
    }

    const tokenKey = `${keyPrefix}-${idx++}`;

    if (match[2] !== undefined && match[3] !== undefined) {
      // [font:key]...[/font]
      const rawFont = match[2].toLowerCase();
      const inner = match[3];
      const fontCls = isValidCmsFont(rawFont) ? getCmsFontClass(rawFont) : '';
      const opticalBump = rawFont === 'great-vibes' ? 'text-[1.24em] leading-none inline-block align-baseline' : '';
      nodes.push(
        <span key={tokenKey} className={`${fontCls} ${opticalBump}`.trim()}>
          {parseInlineNodes(inner, tokenKey, depth + 1)}
        </span>
      );
    } else if (match[4] !== undefined) {
      // **bold**
      nodes.push(
        <strong key={tokenKey} className="font-bold text-white">
          {parseInlineNodes(match[4], tokenKey, depth + 1)}
        </strong>
      );
    } else if (match[5] !== undefined) {
      // __underline__
      nodes.push(
        <span
          key={tokenKey}
          className="underline decoration-amber-400/80 underline-offset-4 decoration-[1.5px]"
        >
          {parseInlineNodes(match[5], tokenKey, depth + 1)}
        </span>
      );
    } else if (match[6] !== undefined) {
      // ==gold highlight==
      nodes.push(
        <span
          key={tokenKey}
          className="bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent font-semibold"
        >
          {parseInlineNodes(match[6], tokenKey, depth + 1)}
        </span>
      );
    } else if (match[7] !== undefined) {
      // *italic*
      nodes.push(
        <em key={tokenKey} className="italic">
          {parseInlineNodes(match[7], tokenKey, depth + 1)}
        </em>
      );
    } else {
      nodes.push(match[0]);
    }

    remaining = remaining.slice(match.index + match[0].length);
  }

  return nodes;
}

interface RichCmsTextProps {
  text?: string;
  font?: CmsFontKey;
  className?: string;
}

/**
 * Renders a single CMS string (headline, subtitle, or multi-line paragraph)
 * with inline bold, italic, underline, gold highlight, and custom stylish fonts.
 */
export const RichCmsText: React.FC<RichCmsTextProps> = ({ text = '', font, className = '' }) => {
  if (!text) return null;
  const fontCls = getCmsFontClass(font);
  const lines = text.split('\n');

  const rendered = lines.map((line, lineIdx) => (
    <React.Fragment key={lineIdx}>
      {parseInlineNodes(line, `l${lineIdx}`)}
      {lineIdx < lines.length - 1 && <br />}
    </React.Fragment>
  ));

  if (!fontCls && !className) {
    return <>{rendered}</>;
  }

  return <span className={`${fontCls} ${className}`.trim()}>{rendered}</span>;
};

interface RichPolicyBodyProps {
  content: string;
  titleFont?: CmsFontKey;
  bodyFont?: CmsFontKey;
  variant?: 'page' | 'preview';
}

/**
 * Renders structured Legal Policy & FAQ markdown blocks (`### Headings`, `- Bullets`,
 * paragraphs, and all inline rich-text formatting) identically on both public pages
 * and the Admin CMS Live Preview.
 */
export const RichPolicyBody: React.FC<RichPolicyBodyProps> = ({
  content,
  titleFont,
  bodyFont,
  variant = 'page',
}) => {
  const headingFontClass = getCmsFontClass(titleFont, 'font-display');
  const bodyFontClass = getCmsFontClass(bodyFont, '');

  const rawSections = (content || '').split(/(?=^###\s+)/m).filter((s) => s.trim().length > 0);

  const renderLines = (bodyText: string) => {
    const lines = bodyText.split('\n');
    const blocks: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = (key: string) => {
      if (listItems.length === 0) return;
      blocks.push(
        <ul key={key} className="space-y-2 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 mt-2 shrink-0" />
              <span className={bodyFontClass}>
                <RichCmsText text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    };

    lines.forEach((rawLine, idx) => {
      const trimmed = rawLine.trim();
      if (!trimmed) {
        flushList(`ul-${idx}`);
        return;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        listItems.push(trimmed.slice(2).trim());
        return;
      }
      flushList(`ul-pre-${idx}`);
      blocks.push(
        <p key={`p-${idx}`} className={`text-sm text-zinc-300 leading-relaxed font-light ${bodyFontClass}`}>
          <RichCmsText text={trimmed} />
        </p>
      );
    });

    flushList('ul-end');
    return blocks;
  };

  if (rawSections.length === 0) {
    return (
      <p className="text-sm text-zinc-500 italic">
        No policy content added yet.
      </p>
    );
  }

  return (
    <div className={variant === 'preview' ? 'space-y-4' : 'space-y-6'}>
      {rawSections.map((sec, idx) => {
        const trimmed = sec.trim();
        const isHeadingSection = trimmed.startsWith('### ');
        const lines = trimmed.split('\n');
        const heading = isHeadingSection ? lines[0].replace(/^###\s+/, '').trim() : '';
        const body = isHeadingSection ? lines.slice(1).join('\n').trim() : trimmed;

        return (
          <div
            key={idx}
            className={
              variant === 'preview'
                ? 'p-5 rounded-2xl bg-[#0e0e14] border border-white/[0.07] space-y-3'
                : 'p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-xl'
            }
          >
            {heading && (
              <h2
                className={`${headingFontClass} text-xl sm:text-2xl font-semibold text-white flex items-center gap-3`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span>
                  <RichCmsText text={heading} />
                </span>
              </h2>
            )}
            <div className="space-y-3">{renderLines(body)}</div>
          </div>
        );
      })}
    </div>
  );
};
