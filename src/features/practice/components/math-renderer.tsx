'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  display?: boolean;
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
      const regex = /(\$\$?.*?\$\$?)/g;
      const parts = content.split(regex);
      
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
