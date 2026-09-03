'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Quote } from 'lucide-react';
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

  // Auto scroll every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const max = quotes.length - 1;
        const next = index >= max ? 0 : index + 1;
        
        // Cập nhật index state
        setIndex(next);
        
        // Scroll đến phần tử tiếp theo
        const clientWidth = scrollRef.current.clientWidth;
        scrollRef.current.scrollTo({
          left: next * clientWidth,
          behavior: 'smooth'
        });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [index]);

  // Handle manual scroll (swipe/drag)
  const handleScroll = () => {
    if (scrollRef.current) {
      const clientWidth = scrollRef.current.clientWidth;
      const scrollLeft = scrollRef.current.scrollLeft;
      // Tính index dựa trên vị trí scroll
      const idx = Math.round(scrollLeft / clientWidth);
      if (idx !== index) {
        setIndex(idx);
      }
    }
  };

  return (
    <Card 
      className="rounded-[24px] border border-white/60 dark:border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-gradient-to-br from-white to-fuchsia-50 dark:from-fuchsia-500 dark:to-indigo-600 text-[#1e1b4b] dark:text-white overflow-hidden relative group"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 dark:bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 dark:bg-white/10 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none" />

      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory relative z-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Custom scrollbar hide for webkit */}
        <style dangerouslySetInnerHTML={{__html: `
          div::-webkit-scrollbar { display: none; }
        `}} />
        
        {quotes.map((q, i) => (
          <div key={i} className="w-full flex-shrink-0 snap-center p-8 flex flex-col justify-center items-center text-center min-h-[220px]">
             <Quote className="w-8 h-8 mx-auto text-fuchsia-500/20 dark:text-white/30 mb-4 fill-fuchsia-500/5 dark:fill-white/10" />
             <p className="font-semibold text-[15px] leading-relaxed whitespace-pre-line drop-shadow-sm text-slate-700 dark:text-white">
               "{q.quote}"
             </p>
             <p className="mt-4 text-[13px] font-medium text-slate-500 dark:text-white/70 tracking-wide uppercase">
               — {q.author}
             </p>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIndex(i);
              scrollRef.current?.scrollTo({
                left: i * (scrollRef.current?.clientWidth || 0),
                behavior: 'smooth'
              });
            }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === i 
                ? "w-4 bg-fuchsia-500 dark:bg-white" 
                : "w-1.5 bg-fuchsia-200 hover:bg-fuchsia-300 dark:bg-white/30 dark:hover:bg-white/50"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </Card>
  );
}
