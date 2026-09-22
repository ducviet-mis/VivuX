import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import { normalizeLatexInput, normalizeSlashFractions } from './normalize-latex.ts';

test('turns the exam answer examples into stacked fractions', () => {
  assert.equal(normalizeLatexInput('1/x + 2'), '\\frac{1}{x} + 2');
  assert.equal(normalizeLatexInput('x/(y+1)'), '\\frac{x}{y+1}');
});

test('keeps numerator, denominator, powers, and nested fractions grouped', () => {
  assert.equal(normalizeSlashFractions('(x+1)/(y-1)'), '\\frac{x+1}{y-1}');
  assert.equal(normalizeSlashFractions('x^2/y^3'), '\\frac{x^2}{y^3}');
  assert.equal(normalizeSlashFractions('(x+y)^2/z'), '\\frac{(x+y)^2}{z}');
  assert.equal(normalizeSlashFractions('1/(x/y)'), '\\frac{1}{\\frac{x}{y}}');
  assert.equal(normalizeSlashFractions('a/b/c'), '\\frac{\\frac{a}{b}}{c}');
  assert.equal(normalizeLatexInput('\\left(x+1\\right)/y'), '\\frac{x+1}{y}');
});

test('preserves existing LaTeX and prose inside text commands', () => {
  assert.equal(normalizeSlashFractions('\\frac{1}{2}'), '\\frac{1}{2}');
  assert.equal(normalizeSlashFractions('\\sqrt{x}/2'), '\\frac{\\sqrt{x}}{2}');
  assert.equal(normalizeSlashFractions('\\text{and/or} + x/y'), '\\text{and/or} + \\frac{x}{y}');
});

test('accepts alternative fraction slashes and common Unicode operators', () => {
  assert.equal(normalizeLatexInput('1⁄2 ≤ 3∕4'), '\\frac{1}{2}  \\le  \\frac{3}{4}');
  assert.equal(normalizeLatexInput('π/2'), ' \\frac{\\pi}{2}');
});

test('generated fractions are valid KaTeX', () => {
  for (const expression of ['1/x + 2', 'x/(y+1)', '(x+1)/(y-1)', '1/(x/y)', 'x^2/y^3']) {
    assert.doesNotThrow(() => katex.renderToString(normalizeLatexInput(expression), { throwOnError: true }));
  }
});
