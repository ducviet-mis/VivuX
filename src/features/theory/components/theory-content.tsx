'use client';

import { useEffect, useState } from 'react';
import katex from 'katex';

function renderMathInHtml(source: string) {
  const container = document.createElement('div');
  container.innerHTML = source;

  container.querySelectorAll('script, iframe, object, embed').forEach((node) => node.remove());
  container.querySelectorAll<HTMLElement>('*').forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      if (attribute.name.toLowerCase().startsWith('on')) node.removeAttribute(attribute.name);
      if ((attribute.name === 'href' || attribute.name === 'src') && /^\s*javascript:/i.test(attribute.value)) {
        node.removeAttribute(attribute.name);
      }
    });
  });

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  textNodes.forEach((textNode) => {
    const text = textNode.nodeValue ?? '';
    if (!text.includes('$')) return;

    const fragment = document.createDocumentFragment();
    const regex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let hasMath = false;

    while ((match = regex.exec(text))) {
      hasMath = true;
      if (match.index > lastIndex) fragment.append(document.createTextNode(text.slice(lastIndex, match.index)));
      const display = Boolean(match[1]);
      const span = document.createElement('span');
      span.className = display ? 'my-4 block overflow-x-auto text-center' : 'inline-block max-w-full align-middle';
      try {
        span.innerHTML = katex.renderToString((match[1] ?? match[2]).trim(), {
          displayMode: display,
          throwOnError: false,
          strict: false,
        });
      } catch {
        span.textContent = match[0];
      }
      fragment.append(span);
      lastIndex = regex.lastIndex;
    }

    if (!hasMath) return;
    if (lastIndex < text.length) fragment.append(document.createTextNode(text.slice(lastIndex)));
    textNode.replaceWith(fragment);
  });

  return container.innerHTML;
}

export function TheoryContent({ html }: { html: string }) {
  const [renderedHtml, setRenderedHtml] = useState('');

  useEffect(() => {
    setRenderedHtml(renderMathInHtml(html));
  }, [html]);

  return (
    <div
      className="prose prose-base vivux-prose max-w-none break-words leading-7 prose-headings:font-bold prose-img:mx-auto prose-img:max-w-full prose-img:rounded-2xl sm:prose-lg sm:leading-8"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
