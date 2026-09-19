'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';
import type { FlytieeMood, FlytieeProfile } from './types';
import styles from './flytiee-bird.module.css';

interface FlytieeBirdProps {
  mood: FlytieeMood;
  profile: FlytieeProfile;
  className?: string;
}

function AccessoryLayers({ profile }: { profile: FlytieeProfile }) {
  const { head, eyes, neck, hand } = profile.equipped;
  return (
    <>
      {head === 'focus-band' && <g aria-hidden="true"><path d="M270 326Q457 278 640 321L638 348Q452 307 267 357Z" fill="#fff6e5" stroke="#c78b68" strokeWidth="5"/><path d="M625 325L685 299L672 340L697 372L630 350" fill="#ee8d85" stroke="#b85f65" strokeWidth="5"/><path d="M445 307l10 16 18 3-13 13 2 16-17-8-16 8 3-17-13-12 18-3Z" fill="#ee8d85"/></g>}
      {head === 'graduation-cap' && <g aria-hidden="true"><path d="M337 218L340 278Q450 314 567 273L570 211" fill="#455580" stroke="#2e3d62" strokeWidth="6"/><path d="M258 206L451 147L651 201L454 264Z" fill="#586ea5" stroke="#2e3d62" strokeWidth="6" strokeLinejoin="round"/><path d="M454 205L620 233L624 292" stroke="#ffd584" strokeWidth="7"/><path d="M612 290H636L642 324H607Z" fill="#ffd584"/></g>}
      {eyes === 'round-glasses' && <g aria-hidden="true" fill="none" stroke="#485672" strokeWidth="8"><circle cx="390" cy="413" r="51"/><circle cx="558" cy="407" r="48"/><path d="M441 405Q474 384 510 401M340 406L316 396M606 401L629 389"/></g>}
      {eyes === 'lab-goggles' && <g aria-hidden="true"><rect x="329" y="362" width="290" height="105" rx="36" fill="#a0e3e0" fillOpacity=".16" stroke="#499fa7" strokeWidth="10"/><path d="M329 407L310 402M619 405L638 397M477 367V458" stroke="#499fa7" strokeWidth="7"/></g>}
      {neck === 'red-scarf' && <g aria-hidden="true"><path d="M347 506Q471 542 594 495L513 586L478 555L438 591Z" fill="#ee777a" stroke="#b44e65" strokeWidth="5"/><path d="M474 550L450 638L488 619L513 639L505 549Z" fill="#df6572" stroke="#b44e65" strokeWidth="5"/><ellipse cx="490" cy="551" rx="21" ry="17" fill="#f68c87" stroke="#b44e65" strokeWidth="5"/></g>}
      {neck === 'class-bow' && <g aria-hidden="true"><path d="M374 502Q392 490 478 535Q549 481 571 496V579Q547 591 482 551Q400 598 374 581Z" fill="#5cb5ac" stroke="#347f84" strokeWidth="6"/><rect x="466" y="524" width="37" height="38" rx="12" fill="#b4e4d8" stroke="#347f84" strokeWidth="5"/></g>}
      {hand === 'study-pencil' && <g aria-hidden="true" transform="rotate(15 645 585)"><path d="M622 485H668V662L645 709L622 662Z" fill="#ffd276" stroke="#b47c48" strokeWidth="5"/><path d="M645 488V659" stroke="#e7a548" strokeWidth="7"/><path d="M622 662L645 709L668 662Z" fill="#fce4b7" stroke="#b47c48" strokeWidth="4"/><path d="M635 692L645 709L654 692" fill="#46506c"/><rect x="622" y="460" width="46" height="38" rx="10" fill="#eea5b4" stroke="#b7778b" strokeWidth="5"/></g>}
      {hand === 'idea-book' && <g aria-hidden="true" transform="rotate(-10 648 591)"><rect x="575" y="495" width="143" height="188" rx="15" fill="#82c9ba" stroke="#428c89" strokeWidth="6"/><path d="M598 497V680" stroke="#428c89" strokeWidth="8"/><rect x="613" y="521" width="85" height="68" rx="7" fill="#fff4dd"/><path d="M627 541H684M627 554H677M627 567H665" stroke="#afbbba" strokeWidth="5"/></g>}
    </>
  );
}

export function FlytieeBird({ mood, profile, className }: FlytieeBirdProps) {
  const gradientId = useId().replace(/:/g, '');
  return (
    <svg className={cn(styles.bird, className)} data-mood={mood} viewBox="170 130 590 650" fill="none" role="img" aria-label={`${profile.name} đang ${mood === 'hungry' ? 'đói bụng' : 'chơi vui vẻ'}`}>
      <defs>
        <linearGradient id={`${gradientId}-body`} x1="296" y1="260" x2="628" y2="708" gradientUnits="userSpaceOnUse"><stop stopColor="#a8b6ff"/><stop offset=".48" stopColor="#8394f5"/><stop offset="1" stopColor="#6574d9"/></linearGradient>
        <linearGradient id={`${gradientId}-belly`} x1="475" y1="438" x2="475" y2="704" gradientUnits="userSpaceOnUse"><stop stopColor="#fff9e9"/><stop offset="1" stopColor="#f3e9d6"/></linearGradient>
      </defs>
      <ellipse cx="454" cy="759" rx="150" ry="17" fill="#7b84ae" opacity=".14"/>
      <g className={styles.body}>
        <g fill="#f4b66b" stroke="#d48a45" strokeWidth="5" strokeLinejoin="round"><path d="M365 696C351 711 350 731 338 739C327 747 329 757 342 758H390C408 757 405 744 391 739L390 701Z"/><path d="M510 702L514 739C500 748 505 758 519 758H564C580 757 579 748 565 740L546 696Z"/></g>
        <g className={styles.leftWing}><path d="M593 493C637 468 661 429 683 387C694 366 709 376 707 394L702 421C724 399 739 410 728 431L717 451C740 438 751 452 732 471C756 465 760 480 741 496C710 526 663 551 613 547Z" fill="#8ea2fb" stroke="#596dcb" strokeWidth="6" strokeLinejoin="round"/></g>
        <path d="M366 267C342 239 338 217 350 203C363 189 389 210 413 237C407 201 416 175 433 173C452 171 461 206 463 236C480 213 500 205 511 218C520 230 507 253 491 267C609 285 671 396 666 532C663 663 595 730 467 735C340 741 240 695 226 576C209 433 251 303 366 267Z" fill={`url(#${gradientId}-body)`} stroke="#586ac4" strokeWidth="7"/>
        <path d="M296 362C321 326 345 312 370 303M421 244C422 226 424 214 429 205" stroke="#d0d9ff" strokeWidth="12" strokeLinecap="round" opacity=".65"/>
        <path d="M472 484C491 465 504 459 519 462C532 466 542 478 550 493C611 519 626 569 614 624C601 687 545 714 466 713C378 712 322 680 318 624C314 565 349 523 411 505C436 498 454 491 472 484Z" fill={`url(#${gradientId}-belly)`}/>
        <g className={styles.rightWing}><path d="M267 432C241 444 228 479 234 521C239 561 259 588 294 606C310 614 322 606 319 592C315 577 298 557 295 536C293 511 308 484 302 460C298 442 284 429 267 432Z" fill="#768aeb" stroke="#596dcb" strokeWidth="6"/><path d="M262 478C253 511 271 548 289 561" stroke="#acbbff" strokeWidth="8" strokeLinecap="round"/></g>
        <g className={styles.eyes}><ellipse cx="388" cy="412" rx="39" ry="48" fill="#fffef7"/><ellipse cx="559" cy="406" rx="35" ry="45" fill="#fffef7"/><g className={styles.pupils}><ellipse cx="400" cy="419" rx="23" ry="31" fill="#283559"/><ellipse cx="568" cy="413" rx="21" ry="29" fill="#283559"/><ellipse cx="394" cy="404" rx="9" ry="11" fill="white"/><ellipse cx="562" cy="399" rx="8" ry="10" fill="white"/></g></g>
        <g className={styles.happyEyes} fill="none" stroke="#283559" strokeWidth="10" strokeLinecap="round"><path d="M356 422Q386 380 420 418M531 414Q560 376 589 409"/></g>
        <g className={styles.hungryFace}><path d="M352 404Q389 421 428 397" stroke="#5868b4" strokeWidth="7" strokeLinecap="round"/><path d="M526 396Q558 414 594 392" stroke="#5868b4" strokeWidth="7" strokeLinecap="round"/><ellipse cx="394" cy="429" rx="18" ry="22" fill="#283559"/><ellipse cx="563" cy="423" rx="17" ry="21" fill="#283559"/><ellipse cx="508" cy="480" rx="17" ry="24" fill="#754c48" stroke="#d4954d" strokeWidth="6"/></g>
        <ellipse cx="356" cy="465" rx="27" ry="14" fill="#e6a5bd" opacity=".8"/><ellipse cx="598" cy="454" rx="23" ry="13" fill="#e6a5bd" opacity=".8"/>
        <g className={styles.beak}><path d="M482 477C490 502 516 508 531 480" fill="#d98643" stroke="#bc733e" strokeWidth="4"/><path d="M477 466C482 452 496 445 508 446C521 446 538 456 542 465C545 474 528 481 511 483C493 484 474 478 477 466Z" fill="#ffd482" stroke="#d4954d" strokeWidth="4"/></g>
        <AccessoryLayers profile={profile}/>
      </g>
      <g className={styles.sneezePuff} stroke="#bac9f7" strokeWidth="6" strokeLinecap="round"><path d="M551 475L586 465M555 488L594 489M550 500L582 516"/></g>
    </svg>
  );
}
