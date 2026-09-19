'use client';

import { useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';
import type { FlytieeMood, FlytieeProfile } from './types';
import styles from './flytiee-bird.module.css';

interface FlytieeBirdProps {
  mood: FlytieeMood;
  profile: FlytieeProfile;
  className?: string;
}

const MOOD_LABELS: Record<FlytieeMood, string> = {
  idle: 'chớp mắt và thở nhẹ', look: 'ngó nghiêng', sway: 'lắc lư vui vẻ',
  feet: 'ngắm đôi chân', fly: 'tập bay', sneeze: 'hắt xì',
  scratch: 'gãi đầu suy nghĩ', hungry: 'đói bụng', eat: 'ăn ngon lành',
  happy: 'vui vẻ', sleep: 'ngủ ngon',
};

function AccessoryLayers({ profile }: { profile: FlytieeProfile }) {
  const { head, eyes, neck, hand } = profile.equipped;
  return <>
    {head === 'focus-band' && <g aria-hidden="true"><path d="M269 328Q457 278 639 322L638 349Q451 308 267 358Z" fill="#fff6e5" stroke="#c78b68" strokeWidth="5"/><path d="M625 325L685 298L672 340L697 373L630 350" fill="#ee8d85" stroke="#b85f65" strokeWidth="5"/><path d="M446 307l9 16 18 3-13 13 2 16-17-8-16 8 3-17-13-12 18-3Z" fill="#ee8d85"/></g>}
    {head === 'graduation-cap' && <g aria-hidden="true"><path d="M335 217L339 278Q448 316 568 273L572 211" fill="#455580" stroke="#2e3d62" strokeWidth="6"/><path d="M256 206L451 146L653 201L454 265Z" fill="#586ea5" stroke="#2e3d62" strokeWidth="6" strokeLinejoin="round"/><path d="M454 206L620 233L624 293" stroke="#ffd584" strokeWidth="7"/><path d="M612 291H636L642 325H607Z" fill="#ffd584"/><ellipse cx="452" cy="206" rx="12" ry="6" fill="#ffd584"/></g>}
    {eyes === 'round-glasses' && <g aria-hidden="true"><g fill="none" stroke="#485672" strokeWidth="8"><circle cx="390" cy="413" r="51"/><circle cx="558" cy="407" r="48"/><path d="M441 405Q474 384 510 401M340 406L316 396M606 401L629 389"/></g><path d="M355 394L369 383M524 387L538 377" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".7"/></g>}
    {eyes === 'lab-goggles' && <g aria-hidden="true"><rect x="329" y="362" width="290" height="105" rx="36" fill="#a0e3e0" fillOpacity=".18" stroke="#499fa7" strokeWidth="10"/><path d="M329 407L310 402M619 405L638 397M477 367V458" stroke="#499fa7" strokeWidth="7"/><path d="M350 391L388 377M520 392L560 379" stroke="#dcfffa" strokeWidth="6" strokeLinecap="round"/></g>}
    {neck === 'red-scarf' && <g aria-hidden="true"><path d="M347 506Q471 542 594 495L513 586L478 555L438 591Z" fill="#ee777a" stroke="#b44e65" strokeWidth="5"/><path d="M474 550L450 638L488 619L513 639L505 549Z" fill="#df6572" stroke="#b44e65" strokeWidth="5"/><ellipse cx="490" cy="551" rx="21" ry="17" fill="#f68c87" stroke="#b44e65" strokeWidth="5"/></g>}
    {neck === 'class-bow' && <g aria-hidden="true"><path d="M374 502Q392 490 478 535Q549 481 571 496V579Q547 591 482 551Q400 598 374 581Z" fill="#5cb5ac" stroke="#347f84" strokeWidth="6"/><path d="M480 541L421 522M492 541L548 516M478 547L422 566M493 548L550 565" stroke="#9ee0cc" strokeWidth="5"/><rect x="466" y="524" width="37" height="38" rx="12" fill="#b4e4d8" stroke="#347f84" strokeWidth="5"/></g>}
    {hand === 'study-pencil' && <g className={styles.handAccessory} aria-hidden="true"><g transform="rotate(15 645 585)"><path d="M622 485H668V662L645 709L622 662Z" fill="#ffd276" stroke="#b47c48" strokeWidth="5"/><path d="M645 488V659" stroke="#e7a548" strokeWidth="7"/><path d="M622 662L645 709L668 662Z" fill="#fce4b7" stroke="#b47c48" strokeWidth="4"/><path d="M635 692L645 709L654 692" fill="#46506c"/><rect x="622" y="460" width="46" height="38" rx="10" fill="#eea5b4" stroke="#b7778b" strokeWidth="5"/><path d="M623 500H666" stroke="#c4cedb" strokeWidth="11"/></g><path d="M599 578Q628 557 650 581Q661 605 627 614L604 604" fill="#91a5f9" stroke="#596dcb" strokeWidth="6"/></g>}
    {hand === 'idea-book' && <g className={styles.handAccessory} aria-hidden="true"><g transform="rotate(-12 648 591)"><rect x="575" y="495" width="143" height="188" rx="15" fill="#82c9ba" stroke="#428c89" strokeWidth="6"/><path d="M598 497V680" stroke="#428c89" strokeWidth="8"/><rect x="613" y="521" width="85" height="68" rx="7" fill="#fff4dd"/><path d="M627 541H684M627 554H677M627 567H665" stroke="#afbbba" strokeWidth="5"/><path d="M678 617V687L693 677L704 687V617" fill="#f3b27b"/></g><path d="M595 592Q622 574 645 591Q655 615 619 624L600 613" fill="#91a5f9" stroke="#596dcb" strokeWidth="6"/></g>}
  </>;
}

function BirdScene({ mood, profile, gradientId, className }: { mood: FlytieeMood; profile: FlytieeProfile; gradientId: string; className?: string }) {
  return <g className={cn(styles.scene, className)} data-mood={mood} data-held={Boolean(profile.equipped.hand) ? 'true' : 'false'}>
    <ellipse cx="454" cy="760" rx="170" ry="18" fill="#7b84ae" opacity=".17"/>
    <g className={styles.body}>
      <g fill="#f4b66b" stroke="#d48a45" strokeWidth="5" strokeLinejoin="round"><path d="M365 696C351 711 350 731 338 739C327 747 329 757 342 758H390C408 757 405 744 391 739L390 701Z"/><path d="M510 702L514 739C500 748 505 758 519 758H564C580 757 579 748 565 740L546 696Z"/></g>
      <g className={styles.waveWing}><path d="M593 493C637 468 661 429 683 387C694 366 709 376 707 394L702 421C724 399 739 410 728 431L717 451C740 438 751 452 732 471C756 465 760 480 741 496C710 526 663 551 613 547Z" fill="#8ea2fb" stroke="#596dcb" strokeWidth="6" strokeLinejoin="round"/></g>
      <path d="M366 267C342 239 338 217 350 203C363 189 389 210 413 237C407 201 416 175 433 173C452 171 461 206 463 236C480 213 500 205 511 218C520 230 507 253 491 267C609 285 671 396 666 532C663 663 595 730 467 735C340 741 240 695 226 576C209 433 251 303 366 267Z" fill={`url(#${gradientId}-body)`} stroke="#586ac4" strokeWidth="7"/>
      <path d="M296 362C321 326 345 312 370 303M421 244C422 226 424 214 429 205" stroke="#d0d9ff" strokeWidth="12" strokeLinecap="round" opacity=".65"/>
      <path d="M472 484C491 465 504 459 519 462C532 466 542 478 550 493C611 519 626 569 614 624C601 687 545 714 466 713C378 712 322 680 318 624C314 565 349 523 411 505C436 498 454 491 472 484Z" fill={`url(#${gradientId}-belly)`}/>
      <path d="M413 645C442 658 475 659 501 650" stroke="#e3d5bd" strokeWidth="5" strokeLinecap="round"/>
      <g className={styles.restWing}><path d="M267 432C241 444 228 479 234 521C239 561 259 588 294 606C310 614 322 606 319 592C315 577 298 557 295 536C293 511 308 484 302 460C298 442 284 429 267 432Z" fill="#768aeb" stroke="#596dcb" strokeWidth="6"/><path d="M262 478C253 511 271 548 289 561" stroke="#acbbff" strokeWidth="8" strokeLinecap="round"/></g>
      <g className={styles.brows} stroke="#4f5da4" strokeWidth="7" strokeLinecap="round" fill="none"><path d="M365 360C379 350 394 352 405 359"/><path d="M545 352C558 343 575 347 585 357"/></g>
      <g className={styles.eyes}><ellipse cx="388" cy="412" rx="39" ry="48" fill="#fffef7"/><ellipse cx="559" cy="406" rx="35" ry="45" fill="#fffef7"/><ellipse cx="400" cy="419" rx="23" ry="31" fill="#283559"/><ellipse cx="568" cy="413" rx="21" ry="29" fill="#283559"/><ellipse cx="394" cy="404" rx="9" ry="11" fill="#fff"/><ellipse cx="562" cy="399" rx="8" ry="10" fill="#fff"/><circle cx="410" cy="426" r="4" fill="#fff"/><circle cx="577" cy="419" r="3.5" fill="#fff"/></g>
      <g className={styles.closedEyes} fill="none" stroke="#35446d" strokeWidth="9" strokeLinecap="round"><path d="M360 416Q388 444 420 414M532 410Q558 436 585 408"/></g>
      <ellipse cx="356" cy="465" rx="27" ry="14" fill="#e6a5bd" opacity=".8"/><ellipse cx="598" cy="454" rx="23" ry="13" fill="#e6a5bd" opacity=".8"/>
      <g className={styles.beak}><path d="M482 477C490 502 516 508 531 480" fill="#d98643" stroke="#bc733e" strokeWidth="4"/><path d="M477 466C482 452 496 445 508 446C521 446 538 456 542 465C545 474 528 481 511 483C493 484 474 478 477 466Z" fill="#ffd482" stroke="#d4954d" strokeWidth="4"/><path d="M492 460C498 456 505 455 511 456" stroke="#ffebc0" strokeWidth="6" strokeLinecap="round"/></g>

      <g className={cn(styles.expression, styles.faceHungry)}><path d="M356 364Q384 365 407 344M539 343Q560 364 586 361" stroke="#4f5da4" strokeWidth="8" strokeLinecap="round"/><g className={styles.hungryGaze}><path d="M351 404Q389 421 428 397C431 442 414 458 391 458C366 458 351 440 351 404Z" fill="#fffef7"/><path d="M526 396Q558 414 594 392C596 434 583 450 560 451C538 451 526 434 526 396Z" fill="#fffef7"/><ellipse cx="394" cy="433" rx="20" ry="23" fill="#283559"/><ellipse cx="563" cy="426" rx="18" ry="22" fill="#283559"/><ellipse cx="388" cy="422" rx="7" ry="9" fill="#fff"/><ellipse cx="558" cy="416" rx="7" ry="8" fill="#fff"/><path d="M351 404Q389 421 428 397M526 396Q558 414 594 392" stroke="#5868b4" strokeWidth="7" strokeLinecap="round"/></g><ellipse cx="508" cy="480" rx="19" ry="27" fill="#754c48" stroke="#d4954d" strokeWidth="7"/><path d="M497 497Q508 484 519 497" fill="#ee9b9f"/><path d="M480 463Q506 440 534 463Q510 480 480 463Z" fill="#ffd482" stroke="#d4954d" strokeWidth="4"/></g>

      <g className={cn(styles.expression, styles.faceScratch)}><path d="M354 348Q380 330 408 342M541 372L582 360" stroke="#4f5da4" strokeWidth="8" strokeLinecap="round"/><ellipse cx="388" cy="407" rx="38" ry="48" fill="#fffef7"/><path d="M527 401Q559 383 591 398Q588 444 558 443Q531 442 527 401Z" fill="#fffef7"/><g className={styles.thinkingGaze}><ellipse cx="400" cy="393" rx="20" ry="27" fill="#283559"/><ellipse cx="569" cy="407" rx="17" ry="24" fill="#283559"/><circle cx="394" cy="382" r="8" fill="#fff"/><circle cx="564" cy="397" r="7" fill="#fff"/></g><path d="M527 401Q559 383 591 398" stroke="#5868b4" strokeWidth="6" strokeLinecap="round"/><path d="M482 465Q507 445 536 462Q521 482 493 479Z" fill="#ffd482" stroke="#d4954d" strokeWidth="4"/><path d="M494 480Q512 474 529 480" stroke="#92653f" strokeWidth="5" strokeLinecap="round"/><g className={styles.scratchHand}><path d="M628 522C660 492 668 446 652 401L637 353C632 338 620 341 621 355L624 374L609 350C601 339 589 345 596 359L608 382L590 369C578 361 570 371 580 382L612 418C621 447 604 480 601 494Z" fill="#8ea2fb" stroke="#596dcb" strokeWidth="6" strokeLinejoin="round"/><path d="M623 418Q640 455 625 480" stroke="#bccaff" strokeWidth="7" strokeLinecap="round"/></g></g>

      <g className={cn(styles.expression, styles.faceHappy)}><path d="M363 348Q386 334 408 346M540 342Q561 328 582 342" stroke="#4f5da4" strokeWidth="7" strokeLinecap="round"/><path d="M356 422Q386 369 420 418M531 414Q560 366 589 409" stroke="#283559" strokeWidth="11" strokeLinecap="round"/><ellipse cx="349" cy="461" rx="31" ry="18" fill="#efa9ba"/><ellipse cx="600" cy="451" rx="27" ry="17" fill="#efa9ba"/><path d="M481 473Q509 465 539 470C535 516 492 523 481 473Z" fill="#754c48" stroke="#d4954d" strokeWidth="5"/><path d="M494 504Q510 483 528 500Q514 518 494 504Z" fill="#f1a0aa"/><path d="M476 464Q508 438 542 461Q512 480 476 464Z" fill="#ffd482" stroke="#d4954d" strokeWidth="4"/></g>

      <g className={cn(styles.expression, styles.faceEat)}><path d="M364 354Q387 345 407 353M539 347Q561 339 583 349" stroke="#4f5da4" strokeWidth="7" strokeLinecap="round"/><path d="M358 421Q388 384 419 416M533 414Q558 381 587 409" stroke="#283559" strokeWidth="10" strokeLinecap="round"/><g className={styles.chewingCheeks}><ellipse cx="371" cy="475" rx="41" ry="29" fill="#a5b0fc"/><ellipse cx="587" cy="467" rx="36" ry="27" fill="#a5b0fc"/><ellipse cx="364" cy="471" rx="26" ry="15" fill="#efa9ba"/><ellipse cx="594" cy="463" rx="24" ry="14" fill="#efa9ba"/></g><g className={styles.chewingMouth}><ellipse cx="510" cy="481" rx="15" ry="20" fill="#754c48" stroke="#d4954d" strokeWidth="5"/><path d="M478 463Q507 440 539 461Q511 482 478 463Z" fill="#ffd482" stroke="#d4954d" strokeWidth="4"/></g><g fill="#eeb66f"><circle cx="478" cy="495" r="4"/><circle cx="544" cy="487" r="5"/><circle cx="538" cy="502" r="3"/></g></g>

      <g className={styles.hungryLines} stroke="#d39b5b" strokeWidth="5" fill="none" strokeLinecap="round"><path d="M382 576q-15 18 0 34M367 567q-24 27 0 53M552 576q15 18 0 34M567 567q24 27 0 53"/></g>
      <g className={styles.scratchMarks} stroke="#b1bbff" strokeWidth="6" strokeLinecap="round"><path d="M659 334l20-18M668 351l24-3"/></g>
      <g className={styles.food} fill="#eeb66f" stroke="#c18746" strokeWidth="3"><ellipse cx="504" cy="515" rx="9" ry="14"/><ellipse cx="528" cy="536" rx="8" ry="12"/></g>
      <g className={styles.sneezePuff} stroke="#bac9f7" strokeWidth="6" strokeLinecap="round"><path d="M551 475L586 465M555 488L594 489M550 500L582 516"/></g>
      <g className={styles.flyingAir} stroke="#acb9ef" strokeWidth="5" strokeLinecap="round"><path d="M254 643Q273 651 290 644M628 649Q649 657 667 648M281 681H305M612 684H637"/></g>
      <AccessoryLayers profile={profile}/>
    </g>
    <g className={styles.sleepZ}><text x="650" y="340">z</text><text x="689" y="289">Z</text><text x="729" y="235">Z</text></g>
  </g>;
}

export function FlytieeBird({ mood, profile, className }: FlytieeBirdProps) {
  const gradientId = useId().replace(/:/g, '');
  const [visibleMood, setVisibleMood] = useState(mood);
  const [previousMood, setPreviousMood] = useState<FlytieeMood | null>(null);

  useEffect(() => {
    if (mood === visibleMood) return;
    setPreviousMood(visibleMood);
    setVisibleMood(mood);
  }, [mood, visibleMood]);

  useEffect(() => {
    if (!previousMood) return;
    const duration = previousMood === 'sleep' || visibleMood === 'sleep' ? 750 : 440;
    const timer = window.setTimeout(() => setPreviousMood(null), duration);
    return () => window.clearTimeout(timer);
  }, [previousMood, visibleMood]);

  const longTransition = previousMood === 'sleep' || visibleMood === 'sleep';
  return <svg className={cn(styles.bird, className)} viewBox="160 110 650 700" fill="none" role="img" aria-label={`${profile.name} đang ${MOOD_LABELS[mood]}`}>
    <defs><linearGradient id={`${gradientId}-body`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a8b6ff"/><stop offset=".5" stopColor="#8394f5"/><stop offset="1" stopColor="#6574d9"/></linearGradient><linearGradient id={`${gradientId}-belly`} x2="0" y2="1"><stop stopColor="#fff9e9"/><stop offset="1" stopColor="#f3e9d6"/></linearGradient></defs>
    {previousMood && <BirdScene key={`${previousMood}-out`} mood={previousMood} profile={profile} gradientId={gradientId} className={cn(styles.sceneExit, longTransition && styles.sceneTransitionLong)}/>}
    <BirdScene key={`${visibleMood}-in`} mood={visibleMood} profile={profile} gradientId={gradientId} className={cn(previousMood && styles.sceneEnter, longTransition && styles.sceneTransitionLong)}/>
  </svg>;
}
