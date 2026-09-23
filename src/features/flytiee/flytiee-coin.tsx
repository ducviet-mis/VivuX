import type { SVGProps } from 'react';

/** The little wing stamped on this coin makes it FlyTiee's own currency. */
export function FlytieeCoin({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" width="24" height="24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="32" cy="34" r="29" fill="#9B571C" />
      <circle cx="32" cy="31" r="29" fill="#D78B2B" />
      <circle cx="32" cy="30" r="25.5" fill="#F6BF52" stroke="#FFE6A0" strokeWidth="2" />
      <circle cx="32" cy="30" r="20" fill="#FFD879" stroke="#C98127" strokeWidth="1.5" />
      <path d="M19 37c10-1 18-6 24-17 1.5 10-2 19-11 21-5 1-10-1-13-4Z" fill="#3764B8" />
      <path d="M19 37c11-3 18-7 24-17-2 8-8 14-17 18" fill="#76C9EB" />
      <path d="M25 39c7-5 12-10 15-15" stroke="#FFF4CC" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 17l1.2-3.2L18.5 13l-3.3-1.2L14 8.5l-1.2 3.3L9.5 13l3.3.8L14 17Z" fill="#FFF7D6" />
      <path d="M47 46a24 24 0 0 1-28 1" stroke="#FFE8A4" strokeWidth="2" strokeLinecap="round" opacity=".75" />
    </svg>
  );
}
