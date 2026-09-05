'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Quote, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const quotes = [
  {
    "quote": "Đầu tư vào tri thức luôn mang lại lợi nhuận cao nhất.",
    "author": "Benjamin Franklin"
  },
  {
    "quote": "Thành công là tổng của những nỗ lực nhỏ được lặp đi lặp lại ngày này qua ngày khác.",
    "author": "Robert Collier"
  },
  {
    "quote": "Những kỷ luật nhỏ được lặp lại kiên trì mỗi ngày sẽ tạo nên thành tựu lớn.",
    "author": "John C. Maxwell"
  },
  {
    "quote": "Người không bao giờ mắc sai lầm là người chưa từng làm thử điều gì mới.",
    "author": "Albert Einstein"
  },
  {
    "quote": "Non sông Việt Nam có trở nên tươi đẹp hay không, dân tộc Việt Nam có bước tới đài vinh quang để sánh vai với các cường quốc năm châu được hay không, chính là nhờ một phần lớn ở công học tập của các em.",
    "author": "Chủ tịch Hồ Chí Minh"
  },
  {
    "quote": "Khi bạn khao khát một điều gì đó, cả vũ trụ sẽ hợp lực giúp bạn đạt được nó.",
    "author": "Nhà Giả Kim (Paulo Coelho)"
  },
  {
    "quote": "Không có việc gì khó,\nChỉ sợ lòng không bền,\nĐào núi và lấp biển,\nQuyết chí ắt làm nên.",
    "author": "Chủ tịch Hồ Chí Minh"
  },
  {
    "quote": "Thiên tài chỉ là 1% cảm hứng và 99% mồ hôi.",
    "author": "Thomas Edison"
  },
  {
    "quote": "Hành động là chìa khóa của mọi thành công.",
    "author": "Pablo Picasso"
  }
];


export function QuoteCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (paused || interacting || reducedMotion) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const next = index >= quotes.length - 1 ? 0 : index + 1;
        setIndex(next);
        scrollRef.current.scrollTo({ left: next * scrollRef.current.clientWidth, behavior: 'smooth' });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [index, paused, interacting, reducedMotion]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
      if (idx !== index) setIndex(idx);
    }
  };
  return (
    <Card level="supporting" className="overflow-hidden bg-quote" role="region" aria-roledescription="băng chuyền" aria-label="Góc cảm hứng"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setInteracting(false); }}>
      <div className="flex items-center gap-2 px-6 pt-5 text-special"><Quote aria-hidden="true" className="h-5 w-5" /><h2 className="text-sm font-semibold">Góc cảm hứng</h2></div>
      <div ref={scrollRef} onScroll={handleScroll} className="vivux-quote-scroll flex snap-x snap-mandatory overflow-x-auto">
        {quotes.map((q, i) => (
          <div key={i} className="flex w-full shrink-0 snap-center flex-col justify-center px-6 pb-2 pt-4" aria-hidden={i !== index}>
            <blockquote className="whitespace-pre-line text-base font-medium leading-relaxed text-foreground">“{q.quote}”</blockquote>
            <p className="mt-4 text-xs text-muted-foreground">— {q.author}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-1 px-4 pb-3 pt-1">
        <div className="flex min-w-0 items-center">
          {quotes.map((_, i) => (
            <button key={i} className="flex h-11 w-6 items-center justify-center rounded-sm" aria-label={`Xem trích dẫn ${i + 1}`} aria-pressed={index === i}
              onClick={() => { setIndex(i); scrollRef.current?.scrollTo({ left: i * (scrollRef.current?.clientWidth || 0), behavior: reducedMotion ? 'auto' : 'smooth' }); }}>
              <span className={cn("h-1.5 rounded-full transition-colors", index === i ? "w-4 bg-special" : "w-1.5 bg-special/25")} />
            </button>
          ))}
        </div>
        <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-special-soft hover:text-special"
          onClick={() => setPaused(!paused)} aria-label={paused ? 'Tiếp tục chuyển trích dẫn' : 'Tạm dừng chuyển trích dẫn'} aria-pressed={paused}>
          {paused ? <Play aria-hidden="true" className="h-4 w-4" /> : <Pause aria-hidden="true" className="h-4 w-4" />}
        </button>
      </div>
    </Card>
  );
}
