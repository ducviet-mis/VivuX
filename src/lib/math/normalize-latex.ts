const SIZING_DELIMITER_CHARACTERS = new Set(['(', ')', '[', ']', '{', '}', '|', '.', '/', '<', '>']);

const SIZING_DELIMITER_COMMANDS = new Set([
  '{', '}', '|',
  'lbrace', 'rbrace', 'langle', 'rangle',
  'lfloor', 'rfloor', 'lceil', 'rceil',
  'lgroup', 'rgroup', 'lmoustache', 'rmoustache',
  'vert', 'Vert', 'backslash',
  'uparrow', 'downarrow', 'updownarrow',
  'Uparrow', 'Downarrow', 'Updownarrow',
]);

/**
 * Removes only malformed \left / \right sizing commands while preserving the
 * mathematical expression that follows. For example, AI-authored `\leftx`
 * and `\right=` become `x` and `=` instead of a red KaTeX error.
 */
function removeMalformedSizingCommands(latex: string) {
  return latex.replace(/\\(left|right)/g, (token, _side, offset: number, source: string) => {
    let cursor = offset + token.length;
    while (/\s/.test(source[cursor] ?? '')) cursor += 1;

    const nextCharacter = source[cursor];
    if (nextCharacter && SIZING_DELIMITER_CHARACTERS.has(nextCharacter)) return token;
    if (nextCharacter !== '\\') return '';

    const commandStart = cursor + 1;
    const commandMatch = source.slice(commandStart).match(/^[A-Za-z]+|^./);
    return commandMatch && SIZING_DELIMITER_COMMANDS.has(commandMatch[0]) ? token : '';
  });
}

/** Normalize common AI/JSON LaTeX mistakes before rendering with KaTeX. */
export function normalizeLatexInput(latex: string) {
  let fixed = latex;

  // Fix double backslashes in commands like \\widehat -> \widehat.
  fixed = fixed.replace(/\\\\([a-zA-Z]+)/g, '\\$1');

  fixed = fixed.replace(/(?<![a-zA-Z\\])LeftRightarrow(?![a-zA-Z])/g, '\\Leftrightarrow');
  fixed = fixed.replace(/(?<![a-zA-Z\\])cdot([a-zA-Z])/g, '\\cdot $1');
  fixed = fixed.replace(/(?<![a-zA-Z\\])text([a-zA-Z]+)/g, '\\text{$1}');
  fixed = fixed.replace(/(?<![a-zA-Z\\])Rightarrow([a-zA-Z])/g, '\\Rightarrow $1');
  fixed = fixed.replace(/(?<![a-zA-Z\\])Leftrightarrow([a-zA-Z])/g, '\\Leftrightarrow $1');
  fixed = fixed.replace(/(?<![a-zA-Z\\])neq([a-zA-Z0-9])/g, '\\neq $1');

  fixed = fixed.replace(/(\\in|\bin)\s*(?<!\\)\{([^}]+)(?<!\\)\}/g, '$1 \\{$2\\}');
  fixed = fixed.replace(/>=/g, ' \\ge ');
  fixed = fixed.replace(/<=/g, ' \\le ');
  fixed = fixed.replace(/!=/g, ' \\neq ');

  const commands = [
    'cdot', 'frac', 'text', 'Rightarrow', 'Leftrightarrow', 'leftarrow', 'rightarrow', 'neq', 'circ', 'widehat',
    'sqrt', 'pi', 'alpha', 'beta', 'gamma', 'Delta', 'times', 'div', 'leq', 'geq', 'pm', 'infty', 'approx',
    'sin', 'cos', 'tan', 'cot', 'log', 'ln', 'lim', 'sum', 'prod', 'int', 'in', 'subset', 'cup', 'cap', 'emptyset',
    'triangle', 'angle', 'perp', 'parallel', 'Leftarrow',
  ];

  commands.forEach((command) => {
    const pattern = new RegExp(`(?<![a-zA-Z\\\\])${command}(?![a-zA-Z])`, 'g');
    fixed = fixed.replace(pattern, `\\${command}`);
  });

  return removeMalformedSizingCommands(fixed);
}
