"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { primaryNavigationItems } from "@/components/layout/navigation-items";

export function FloatingBottomNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setHidden(false);
    let lastY = window.scrollY;
    let direction = 0;
    let distance = 0;
    let frame = 0;

    function update() {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      lastY = y;

      if (y < 80) {
        setHidden(false);
        distance = 0;
        return;
      }
      if (Math.abs(delta) < 1) return;

      const nextDirection = Math.sign(delta);
      distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;
      if (distance >= 14) {
        if (nextDirection > 0 && navRef.current?.contains(document.activeElement)) {
          if (document.activeElement?.matches(":focus-visible")) {
            setHidden(false);
            distance = 0;
            return;
          }
          (document.activeElement as HTMLElement).blur();
        }
        setHidden(nextDirection > 0);
        distance = 0;
      }
    }

    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <nav
      ref={navRef}
      aria-label="Điều hướng mobile"
      className={cn(
        "fixed inset-x-3 z-40 mx-auto max-w-md rounded-[1.4rem] border border-border bg-surface/95 p-1.5 shadow-float backdrop-blur-xl transition-transform duration-220 ease-out motion-reduce:transition-none md:hidden",
        "bottom-[calc(env(safe-area-inset-bottom)+12px)]",
        hidden && "pointer-events-none"
      )}
      style={{ transform: hidden ? "translateY(calc(100% + env(safe-area-inset-bottom) + 28px))" : "translateY(0)" }}
      aria-hidden={hidden ? true : undefined}
      onFocusCapture={() => setHidden(false)}
    >
      <div className="flex items-stretch gap-0.5">
        {primaryNavigationItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              tabIndex={hidden ? -1 : undefined}
              className={cn(
                "flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 py-1 text-center text-[10px] font-semibold leading-tight tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={active ? 2.3 : 1.9} />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
