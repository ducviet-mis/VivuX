/** Repair common import artifacts before separating prose from mathematical notation. */
export function prepareMathContent(source: string): string {
  let cleaned = source.replace(/\s*\[cite:\s*[^\]]+\]/gi, '');
  // Some JSON imports double-escape every backslash, including aligned-row breaks.
  if (/\\\\begin\{/.test(cleaned)) {
    cleaned = cleaned.replace(/\\{2,}/g, (slashes) => '\\'.repeat(Math.ceil(slashes.length / 2)));
  }
  return cleaned
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, math: string) => `$$${math}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, math: string) => `$${math}$`);
}

const MATH_ENVIRONMENTS = new Set([
  'aligned', 'alignedat', 'align', 'gathered', 'gather', 'cases', 'dcases',
  'matrix', 'pmatrix', 'bmatrix', 'Bmatrix', 'vmatrix', 'Vmatrix',
  'array', 'equation', 'split',
]);

/** Bare LaTeX environments are display math, even when imported without dollar delimiters. */
export function wrapBareMathEnvironments(source: string): string {
  return source.replace(/\\begin\{([A-Za-z]+)\}(?:\{[^{}]*\})?[\s\S]*?\\end\{\1\}/g, (environment, name: string) =>
    MATH_ENVIRONMENTS.has(name) ? `$$${environment}$$` : environment
  );
}
