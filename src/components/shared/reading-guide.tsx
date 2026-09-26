'use client';

import { useEffect, useRef, useState } from 'react';
import { List } from 'lucide-react';

/** Reading position only: this does not record completion or award study credit. */
export function ReadingGuide({ targetId, contentKey }: { targetId: string; contentKey: string }) {
  const [headings, setHeadings] = useState<Array<{ id: string; title: string }>>([]);
  const [current, setCurrent] = useState('');
  const [percent, setPercent] = useState(0);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;
    let nodes: HTMLElement[] = [];
    const measure = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const visibleHeight = window.innerHeight - 120;
      const distance = Math.max(1, rect.height - visibleHeight);
      setPercent(Math.round(Math.min(1, Math.max(0, (120 - rect.top) / distance)) * 100));
      const passed = nodes.filter((node) => node.getBoundingClientRect().top <= 170);
      setCurrent((passed[passed.length - 1] || nodes[0])?.id || '');
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
    const collect = () => {
      nodes = Array.from(target.querySelectorAll<HTMLElement>('h2, h3'));
      setHeadings(nodes.map((node, index) => {
        node.id ||= `${targetId}-section-${index}`;
        return { id: node.id, title: node.textContent?.trim() || `Mục ${index + 1}` };
      }));
      schedule();
    };
    collect();
    const mutations = new MutationObserver(collect);
    mutations.observe(target, { childList: true, subtree: true });
    const sizes = new ResizeObserver(schedule);
    sizes.observe(target);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      mutations.disconnect(); sizes.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      window.cancelAnimationFrame(frame);
    };
  }, [targetId, contentKey]);

  return (
    <aside className="study-reading-guide" aria-label="Điều hướng bài đọc">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground"><span>Vị trí đọc</span><span className="tabular-nums">{percent}%</span></div>
      <div className="h-1 overflow-hidden rounded-full bg-track" role="progressbar" aria-label="Vị trí trong bài đọc" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className="study-reading-progress" style={{ transform: `scaleX(${percent / 100})` }} /></div>
      {headings.length > 0 && <details ref={detailsRef} className="mt-4" open>
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-foreground"><List className="h-4 w-4 text-primary" aria-hidden="true" />Trong bài này</summary>
        <nav className="mt-2 max-h-[35vh] space-y-1 overflow-y-auto lg:max-h-[55vh]" aria-label="Mục lục bài đọc">
          {headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} aria-current={current === heading.id ? 'location' : undefined}
            className="block rounded-md border-l-2 border-transparent px-3 py-2.5 text-sm leading-5 text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=location]:border-primary aria-[current=location]:bg-primary-soft aria-[current=location]:text-primary"
            onClick={() => { if (window.innerWidth < 1024 && detailsRef.current) detailsRef.current.open = false; }}>
            {heading.title}
          </a>)}
        </nav>
      </details>}
    </aside>
  );
}
