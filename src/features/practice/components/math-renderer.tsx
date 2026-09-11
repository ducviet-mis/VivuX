'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  display?: boolean;
  /** Use the reading-friendly layout intended for a detailed solution. */
  variant?: 'inline' | 'solution';
}

type MathPart = {
  type: 'text' | 'inline-math' | 'display-math';
  value: string;
};

function splitMathParts(content: string): MathPart[] {
  const parts: MathPart[] = [];
  const pattern = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }

    const value = match[0];
    parts.push({
      type: value.startsWith('$$') ? 'display-math' : 'inline-math',
      value: value.startsWith('$$') ? value.slice(2, -2) : value.slice(1, -1),
    });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return parts;
}

function shouldDisplayFormula(math: string) {
  const equalSigns = (math.match(/=/g) || []).length;
  return (
    math.length >= 72 ||
    equalSigns >= 2 ||
    /\\begin\{|\\\\/.test(math)
  );
}

/**
 * Normalizes mathematical expressions in question options or short text so they render properly with KaTeX.
 * Converts pseudo-math like "n in {3; 4}", "n >= 3", "x <= 4", "n = 3", "{3; 4}" into standard LaTeX.
 */
export function formatOptionMath(opt: string): string {
  if (!opt || typeof opt !== 'string') return opt || '';
  let s = opt.trim();

  // If already contains $ ... $, normalize inside the math blocks
  if (s.includes('$')) {
    return s.replace(/\$([^$]+)\$/g, (_, math) => {
      let m = math;
      m = m.replace(/>=/g, ' \\ge ');
      m = m.replace(/<=/g, ' \\le ');
      m = m.replace(/!=/g, ' \\neq ');
      // Fix unescaped set braces like \in {3; 4} -> \in \{3; 4\}
      m = m.replace(/(\\in|\bin)\s*(?<!\\)\{([^}]+)(?<!\\)\}/g, '$1 \\{$2\\}');
      m = m.replace(/(?<![a-zA-Z\\])in(?![a-zA-Z])/g, '\\in');
      return '$' + m + '$';
    });
  }

  // 1. Check for set membership syntax, e.g. "n in {3; 4}", "x in {1; 2}", "n in \{3; 4\}"
  if (/\bin\s*\{([^}]+)\}/i.test(s) || /\bin\s*\\\{([^}]+)\\\}/i.test(s)) {
    let m = s.replace(/(?<![a-zA-Z\\])in\s*(?:\\\{|\{)([^}]+?)(?:\\\}|\})/gi, '\\in \\{$1\\}');
    return `$${m}$`;
  }

  // 2. Check for inequality / comparison operators, e.g. "n >= 3", "n <= 4", "x != 0"
  if (s.includes('>=') || s.includes('<=') || s.includes('!=')) {
    let m = s
      .replace(/>=/g, ' \\ge ')
      .replace(/<=/g, ' \\le ')
      .replace(/!=/g, ' \\neq ');
    return `$${m}$`;
  }

  // 3. Check for single variable comparison or equation, e.g. "n = 3", "x > 0", "x < 5", "y = -2"
  if (/^[a-zA-Z]\s*[=><]\s*[-0-9/.]+$/.test(s)) {
    return `$${s}$`;
  }

  // 4. Check for standalone set notation like "{3; 4}" or "{1, 2, 3}"
  if (/^\{[0-9;,\s-]+\}$/.test(s)) {
    let inner = s.slice(1, -1);
    return `$\\{${inner}\\}$`;
  }

  // 5. Check if it has LaTeX symbols or math notation: \, ^, _, \pm, etc.
  if (s.includes('\\') || s.includes('^') || s.includes('_')) {
    return `$${s}$`;
  }

  return s;
}

export function MathRenderer({ content, display = false, variant = 'inline' }: MathRendererProps) {
  // Fix common LaTeX escaping issues (e.g., missing backslashes due to JSON parse, or double backslashes)
  const fixMath = (math: string) => {
    let fixed = math;
    // Fix double backslashes in commands like \\widehat -> \widehat
    fixed = fixed.replace(/\\\\([a-zA-Z]+)/g, '\\$1');
    
    // Special typo fixes
    fixed = fixed.replace(/(?<![a-zA-Z\\])LeftRightarrow(?![a-zA-Z])/g, '\\Leftrightarrow');
    fixed = fixed.replace(/(?<![a-zA-Z\\])cdot([a-zA-Z])/g, '\\cdot $1');
    fixed = fixed.replace(/(?<![a-zA-Z\\])text([a-zA-Z]+)/g, '\\text{$1}');
    fixed = fixed.replace(/(?<![a-zA-Z\\])Rightarrow([a-zA-Z])/g, '\\Rightarrow $1');
    fixed = fixed.replace(/(?<![a-zA-Z\\])Leftrightarrow([a-zA-Z])/g, '\\Leftrightarrow $1');
    fixed = fixed.replace(/(?<![a-zA-Z\\])neq([a-zA-Z0-9])/g, '\\neq $1');

    // Fix unescaped set braces like \in {3; 4} -> \in \{3; 4\}
    fixed = fixed.replace(/(\\in|\bin)\s*(?<!\\)\{([^}]+)(?<!\\)\}/g, '$1 \\{$2\\}');
    fixed = fixed.replace(/>=/g, ' \\ge ');
    fixed = fixed.replace(/<=/g, ' \\le ');
    fixed = fixed.replace(/!=/g, ' \\neq ');
    
    // Add missing backslashes for common math commands if they don't have one
    const commands = [
      'cdot', 'frac', 'text', 'Rightarrow', 'Leftrightarrow', 'leftarrow', 'rightarrow', 'neq', 'circ', 'widehat', 
      'sqrt', 'pi', 'alpha', 'beta', 'gamma', 'Delta', 'times', 'div', 'leq', 'geq', 'pm', 'infty', 'approx',
      'sin', 'cos', 'tan', 'cot', 'log', 'ln', 'lim', 'sum', 'prod', 'int', 'in', 'subset', 'cup', 'cap', 'emptyset',
      'triangle', 'angle', 'perp', 'parallel', 'Rightarrow', 'Leftarrow', 'Leftrightarrow'
    ];
    
    commands.forEach(cmd => {
      // Regex: match the command if it is NOT preceded by a backslash or a letter
      // (?<![a-zA-Z\\]) is a negative lookbehind (supported in modern JS)
      const regex = new RegExp(`(?<![a-zA-Z\\\\])${cmd}(?![a-zA-Z])`, 'g');
      fixed = fixed.replace(regex, `\\${cmd}`);
    });
    
    return fixed;
  };

  const renderMath = (math: string, displayMode: boolean, key: React.Key) => {
    const html = katex.renderToString(fixMath(math), { displayMode, throwOnError: false });
    return <span key={key} dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const renderedContent = useMemo(() => {
    try {
      if (variant === 'inline') {
        const normalized = formatOptionMath(content);
        const parts = splitMathParts(normalized);

        return parts.map((part, index) => {
          if (part.type === 'display-math') {
            return renderMath(part.value, true, index);
          }
          if (part.type === 'inline-math') {
            return renderMath(part.value, false, index);
          }
          return <span key={index}>{part.value}</span>;
        });
      }

      const parts = splitMathParts(content.replace(/\r\n?/g, '\n'));
      const blocks: React.ReactNode[] = [];
      let paragraph: React.ReactNode[] = [];
      let key = 0;

      const flushParagraph = () => {
        if (!paragraph.some(node => typeof node !== 'string' || node.trim().length > 0)) return;
        blocks.push(
          <p key={`paragraph-${key++}`} className="max-w-[72ch] break-words leading-7 text-pretty">
            {paragraph}
          </p>
        );
        paragraph = [];
      };

      const appendText = (value: string) => {
        const segments = value.split(/(\n\s*\n+)/);
        segments.forEach((segment) => {
          if (/^\n\s*\n+$/.test(segment)) {
            flushParagraph();
            return;
          }

          const lines = segment.split('\n');
          lines.forEach((line, lineIndex) => {
            if (lineIndex > 0) paragraph.push(<br key={`break-${key++}`} />);
            if (line) paragraph.push(line);
          });
        });
      };

      parts.forEach((part, index) => {
        if (part.type === 'text') {
          appendText(part.value);
          return;
        }

        const isDisplay = part.type === 'display-math' || shouldDisplayFormula(part.value);
        if (!isDisplay) {
          paragraph.push(renderMath(part.value, false, `inline-${key++}`));
          return;
        }

        flushParagraph();

        let punctuation = '';
        const followingPart = parts[index + 1];
        if (followingPart?.type === 'text') {
          const punctuationMatch = followingPart.value.match(/^\s*([.,;:])\s*/);
          if (punctuationMatch) {
            punctuation = punctuationMatch[1];
            followingPart.value = followingPart.value.slice(punctuationMatch[0].length);
          }
        }

        blocks.push(
          <div key={`formula-${key++}`} className="-mx-1 overflow-x-auto px-1 py-2 text-center [&_.katex-display]:my-0">
            {renderMath(part.value, true, `display-${key++}`)}{punctuation}
          </div>
        );
      });

      flushParagraph();
      return blocks;
    } catch (e) {
      console.error("Math rendering error:", e);
      return <>{content}</>;
    }
  }, [content, variant]);

  return (
    <div className={`math-renderer ${variant === 'solution' ? 'space-y-3 sm:space-y-4' : display ? 'my-4 text-center' : 'inline'}`}>
      {renderedContent}
    </div>
  );
}
