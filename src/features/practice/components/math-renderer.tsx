'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  display?: boolean;
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

export function MathRenderer({ content, display = false }: MathRendererProps) {
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

  const renderedContent = useMemo(() => {
    try {
      const normalized = formatOptionMath(content);
      const regex = /(\$\$?.*?\$\$?)/g;
      const parts = normalized.split(regex);
      
      return parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = fixMath(part.slice(2, -2));
          const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const math = fixMath(part.slice(1, -1));
          const html = katex.renderToString(math, { displayMode: false, throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        }
        return <span key={index}>{part}</span>;
      });
    } catch (e) {
      console.error("Math rendering error:", e);
      return <>{content}</>;
    }
  }, [content]);

  return <div className={`math-renderer ${display ? 'text-center my-4' : 'inline'}`}>{renderedContent}</div>;
}
