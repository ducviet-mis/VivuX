'use client';

import { useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { getFlytieeSkin } from './config';
import type { FlytieeAccessory, FlytieeMood, FlytieeProfile, FlytieeSkin } from './types';
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

function HeldAccessoryGrip({ skin }: { skin: FlytieeSkin }) {
  return <path d="M595 592Q622 574 645 591Q655 615 619 624L600 613" fill={skin.palette.bodyMid} stroke={skin.palette.outline} strokeWidth="6" strokeLinejoin="round"/>;
}

function AccessoryLayers({ equipped, skin, showGrip = true }: { equipped: FlytieeProfile['equipped']; skin: FlytieeSkin; showGrip?: boolean }) {
  const { head, eyes, neck, hand } = equipped;
  const grip = showGrip ? <HeldAccessoryGrip skin={skin}/> : null;
  return <>
    {head === 'cat-bow-headband' && <g aria-hidden="true" strokeLinejoin="round"><path d="M319 315L348 215L424 292M505 280L574 202L608 304" fill="#fff8f1" stroke="#ba718f" strokeWidth="7"/><path d="M344 278L355 238L390 285M540 275L570 231L585 289" fill="#f6b1c8" stroke="none"/><path d="M292 326Q455 278 626 316L627 349Q457 310 290 359Z" fill="#fff8f1" stroke="#ba718f" strokeWidth="6"/><path d="M548 292Q517 255 489 279Q469 300 503 326Q527 338 548 317Q569 339 594 326Q628 300 608 279Q579 255 548 292Z" fill="#f181a7" stroke="#aa4f75" strokeWidth="6"/><circle cx="548" cy="305" r="17" fill="#ffb0c8" stroke="#aa4f75" strokeWidth="5"/></g>}
    {eyes === 'sweet-heart-glasses' && <g aria-hidden="true" fill="#f7a5bd" fillOpacity=".16" stroke="#d55d87" strokeWidth="7" strokeLinejoin="round"><path d="M390 454C363 435 343 415 343 390C343 365 372 354 390 378C408 354 437 365 437 390C437 415 417 435 390 454Z"/><path d="M558 448C533 431 514 411 514 387C514 363 541 353 558 376C575 353 602 363 602 387C602 411 583 431 558 448Z"/><path d="M435 393Q473 373 516 391M343 395L318 386M602 391L627 380" fill="none"/><path d="M362 383L378 373M535 379L550 369" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".8"/></g>}
    {neck === 'pink-kawaii-bow' && <g aria-hidden="true" strokeLinejoin="round"><path d="M376 508Q395 485 478 535Q551 481 578 502L569 587Q535 597 489 558Q422 603 380 584Z" fill="#f184aa" stroke="#a94f76" strokeWidth="6"/><path d="M481 542L414 516M494 542L555 511M481 551L416 575M494 552L553 578" stroke="#ffbad0" strokeWidth="6"/><rect x="465" y="524" width="43" height="43" rx="14" fill="#ffc0d2" stroke="#a94f76" strokeWidth="5"/><path d="M474 568L456 631L487 614L513 634L501 567Z" fill="#ea7099" stroke="#a94f76" strokeWidth="5"/></g>}
    {hand === 'cat-mini-bag' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><path d="M609 520Q651 474 697 520" fill="none" stroke="#a94f76" strokeWidth="9" strokeLinecap="round"/><path d="M585 529L607 493L630 526H691L714 493L733 531V655Q659 681 585 655Z" fill="#fff7ef" stroke="#a94f76" strokeWidth="6"/><ellipse cx="658" cy="590" rx="7" ry="9" fill="#47516c" stroke="none"/><ellipse cx="696" cy="590" rx="7" ry="9" fill="#47516c" stroke="none"/><path d="M673 611Q681 620 690 611" fill="none" stroke="#d48693" strokeWidth="5" strokeLinecap="round"/><path d="M612 594H644M610 608H643M711 594H739M711 608H741" stroke="#ba718f" strokeWidth="4" strokeLinecap="round"/><path d="M608 535Q584 508 566 528Q553 546 579 565Q596 574 608 558Q621 574 639 565Q665 546 651 528Q634 508 608 535Z" fill="#f181a7" stroke="#a94f76" strokeWidth="5"/><circle cx="608" cy="548" r="13" fill="#ffb0c8" stroke="#a94f76" strokeWidth="4"/>{grip}</g>}
    {hand === 'heart-magic-wand' && <g className={styles.handAccessory} aria-hidden="true" strokeLinecap="round" strokeLinejoin="round"><path d="M619 665L685 506" stroke="#fff6dc" strokeWidth="20"/><path d="M619 665L685 506" stroke="#d96b94" strokeWidth="7"/><path d="M686 520C646 493 641 458 664 444Q687 432 702 458Q719 432 742 445Q766 461 746 490Q727 511 686 535Z" fill="#f184aa" stroke="#a94f76" strokeWidth="6"/><path d="M692 469Q703 453 716 466" fill="none" stroke="#ffd7e4" strokeWidth="6"/><path d="M650 536l7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2Z" fill="#ffe5a4" stroke="#cf9a48" strokeWidth="4"/>{grip}</g>}
    {head === 'santa-hat' && <g aria-hidden="true" strokeLinejoin="round"><path d="M316 306Q345 183 470 145Q572 178 626 296Q525 263 348 324Z" fill="#e9676a" stroke="#ad4656" strokeWidth="7"/><path d="M300 305Q451 270 633 291L638 338Q462 306 292 352Z" fill="#fff8ed" stroke="#d8c7bd" strokeWidth="6"/><path d="M464 146Q545 135 587 194Q617 239 597 287" fill="none" stroke="#ad4656" strokeWidth="7"/><circle cx="597" cy="283" r="38" fill="#fff8ed" stroke="#d8c7bd" strokeWidth="6"/><path d="M326 319Q454 291 611 306" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity=".72"/></g>}
    {eyes === 'snowflake-glasses' && <g aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round"><g stroke="#65b9cc" strokeWidth="8"><circle cx="390" cy="413" r="51"/><circle cx="558" cy="407" r="48"/><path d="M441 405Q474 384 510 401M340 406L316 396M606 401L629 389"/></g><g stroke="#d9fbff" strokeWidth="5"><path d="M328 350V390M309 360L347 380M309 380L347 360"/><path d="M619 343V383M600 353L638 373M600 373L638 353"/></g><circle cx="328" cy="370" r="7" fill="#eefeff" stroke="#65b9cc" strokeWidth="3"/><circle cx="619" cy="363" r="7" fill="#eefeff" stroke="#65b9cc" strokeWidth="3"/></g>}
    {neck === 'jingle-bell' && <g aria-hidden="true" strokeLinejoin="round"><path d="M376 505Q425 486 486 540Q544 482 585 499L566 579Q528 585 487 552Q432 593 394 578Z" fill="#df5963" stroke="#a63f51" strokeWidth="6"/><path d="M486 543Q458 524 427 514M489 543Q520 520 552 508" fill="none" stroke="#f58b87" strokeWidth="6"/><circle cx="489" cy="548" r="20" fill="#f18478" stroke="#a63f51" strokeWidth="5"/><path d="M465 568Q489 550 513 568L529 622Q491 643 450 620Z" fill="#f5c55e" stroke="#b47b35" strokeWidth="6"/><path d="M452 607Q489 624 527 607" fill="none" stroke="#b47b35" strokeWidth="6"/><circle cx="489" cy="623" r="8" fill="#87562f"/></g>}
    {hand === 'candy-cane' && <g className={styles.handAccessory} aria-hidden="true" strokeLinecap="round"><path d="M650 685V511Q650 459 700 459Q739 459 739 498Q739 529 707 536" fill="none" stroke="#a63f51" strokeWidth="40"/><path d="M650 685V511Q650 459 700 459Q739 459 739 498Q739 529 707 536" fill="none" stroke="#fff8eb" strokeWidth="32"/><path d="M650 685V511Q650 459 700 459Q739 459 739 498Q739 529 707 536" fill="none" stroke="#c84c59" strokeWidth="28" strokeDasharray="24 23"/>{grip}</g>}
    {hand === 'christmas-gift' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><rect x="582" y="531" width="150" height="129" rx="14" fill="#57a982" stroke="#31735f" strokeWidth="6"/><rect x="570" y="505" width="174" height="43" rx="12" fill="#72c096" stroke="#31735f" strokeWidth="6"/><path d="M645 507V660H675V507Z" fill="#f4c45e" stroke="#b47b35" strokeWidth="5"/><path d="M660 506Q612 485 619 459Q627 437 661 475Q694 437 705 459Q711 487 660 506Z" fill="#e96d72" stroke="#a94352" strokeWidth="6"/>{grip}</g>}
    {head === 'moon-rabbit' && <g stroke="#c483a9" strokeWidth="6"><ellipse cx="393" cy="231" rx="34" ry="94" transform="rotate(-14 393 231)" fill="#fff4e9"/><ellipse cx="393" cy="225" rx="15" ry="64" transform="rotate(-14 393 225)" fill="#f4b4cd" stroke="none"/><ellipse cx="520" cy="223" rx="34" ry="94" transform="rotate(14 520 223)" fill="#fff4e9"/><ellipse cx="520" cy="217" rx="15" ry="64" transform="rotate(14 520 217)" fill="#f4b4cd" stroke="none"/><path d="M290 335Q455 282 619 328L617 350Q453 310 291 358Z" fill="#fff4e9"/><path d="M457 304a22 22 0 1 0 20 33 19 19 0 0 1-20-33" fill="#ffd479" stroke="#d59a4e"/></g>}
    {eyes === 'moon-glasses' && <g fill="none" stroke="#e8b350" strokeWidth="8"><circle cx="390" cy="413" r="51"/><circle cx="558" cy="407" r="48"/><path d="M441 405Q474 384 510 401M340 406L316 396M606 401L629 389"/><path d="M331 353l7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2Z" fill="#ffe49b" strokeWidth="3"/><path d="M600 348a20 20 0 1 0 17 31 18 18 0 0 1-17-31" fill="#ffe49b" strokeWidth="3"/></g>}
    {neck === 'moon-pendant' && <g stroke="#c89445" strokeWidth="5"><path d="M362 507Q475 615 590 500" fill="none"/><path d="M481 555a43 43 0 1 0 37 65 38 38 0 0 1-37-65" fill="#ffd57a"/><path d="M519 570l7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2Z" fill="#fff1bd" strokeWidth="3"/></g>}
    {hand === 'star-lantern' && <g className={styles.handAccessory} strokeLinecap="round" strokeLinejoin="round"><path d="M614 600L663 454" stroke="#b17b49" strokeWidth="10"/><path d="M663 454V495" stroke="#e9bc65" strokeWidth="4"/><path d="M663 487L685 535L738 540L699 576L709 628L663 602L617 628L627 576L588 540L641 535Z" fill="#f47775" stroke="#ffdb83" strokeWidth="6"/><path d="M663 487V565L738 540M663 565L709 628M663 565L617 628M663 565L588 540" stroke="#ffd780" strokeWidth="3"/><circle cx="663" cy="565" r="17" fill="#ffe99f"/><path d="M655 617V663M665 619V672M675 617V663" stroke="#ed8b78" strokeWidth="5"/>{grip}</g>}
    {hand === 'moon-cake' && <g className={styles.handAccessory}><rect x="587" y="521" width="130" height="125" rx="35" fill="#d79146" stroke="#9e6235" strokeWidth="6"/><rect x="587" y="506" width="130" height="121" rx="35" fill="#f5c16b" stroke="#b9793d" strokeWidth="6"/><rect x="603" y="522" width="98" height="88" rx="25" fill="none" stroke="#d79a48" strokeWidth="5"/><path d="M651 537a27 27 0 1 0 23 41 24 24 0 0 1-23-41" fill="#ffe3a2" stroke="#b9793d" strokeWidth="4"/>{grip}</g>}
    {head === 'focus-band' && <g aria-hidden="true"><path d="M269 328Q457 278 639 322L638 349Q451 308 267 358Z" fill="#fff6e5" stroke="#c78b68" strokeWidth="5"/><path d="M625 325L685 298L672 340L697 373L630 350" fill="#ee8d85" stroke="#b85f65" strokeWidth="5"/><path d="M446 307l9 16 18 3-13 13 2 16-17-8-16 8 3-17-13-12 18-3Z" fill="#ee8d85"/></g>}
    {head === 'graduation-cap' && <g aria-hidden="true"><path d="M335 217L339 278Q448 316 568 273L572 211" fill="#455580" stroke="#2e3d62" strokeWidth="6"/><path d="M256 206L451 146L653 201L454 265Z" fill="#586ea5" stroke="#2e3d62" strokeWidth="6" strokeLinejoin="round"/><path d="M454 206L620 233L624 293" stroke="#ffd584" strokeWidth="7"/><path d="M612 291H636L642 325H607Z" fill="#ffd584"/><ellipse cx="452" cy="206" rx="12" ry="6" fill="#ffd584"/></g>}
    {eyes === 'round-glasses' && <g aria-hidden="true"><g fill="none" stroke="#485672" strokeWidth="8"><circle cx="390" cy="413" r="51"/><circle cx="558" cy="407" r="48"/><path d="M441 405Q474 384 510 401M340 406L316 396M606 401L629 389"/></g><path d="M355 394L369 383M524 387L538 377" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".7"/></g>}
    {eyes === 'lab-goggles' && <g aria-hidden="true"><rect x="329" y="362" width="290" height="105" rx="36" fill="#a0e3e0" fillOpacity=".18" stroke="#499fa7" strokeWidth="10"/><path d="M329 407L310 402M619 405L638 397M477 367V458" stroke="#499fa7" strokeWidth="7"/><path d="M350 391L388 377M520 392L560 379" stroke="#dcfffa" strokeWidth="6" strokeLinecap="round"/></g>}
    {neck === 'red-scarf' && <g aria-hidden="true"><path d="M347 506Q471 542 594 495L513 586L478 555L438 591Z" fill="#ee777a" stroke="#b44e65" strokeWidth="5"/><path d="M474 550L450 638L488 619L513 639L505 549Z" fill="#df6572" stroke="#b44e65" strokeWidth="5"/><ellipse cx="490" cy="551" rx="21" ry="17" fill="#f68c87" stroke="#b44e65" strokeWidth="5"/></g>}
    {neck === 'class-bow' && <g aria-hidden="true"><path d="M374 502Q392 490 478 535Q549 481 571 496V579Q547 591 482 551Q400 598 374 581Z" fill="#5cb5ac" stroke="#347f84" strokeWidth="6"/><path d="M480 541L421 522M492 541L548 516M478 547L422 566M493 548L550 565" stroke="#9ee0cc" strokeWidth="5"/><rect x="466" y="524" width="37" height="38" rx="12" fill="#b4e4d8" stroke="#347f84" strokeWidth="5"/></g>}
    {hand === 'study-pencil' && <g className={styles.handAccessory} aria-hidden="true"><g transform="rotate(15 645 585)"><path d="M622 485H668V662L645 709L622 662Z" fill="#ffd276" stroke="#b47c48" strokeWidth="5"/><path d="M645 488V659" stroke="#e7a548" strokeWidth="7"/><path d="M622 662L645 709L668 662Z" fill="#fce4b7" stroke="#b47c48" strokeWidth="4"/><path d="M635 692L645 709L654 692" fill="#46506c"/><rect x="622" y="460" width="46" height="38" rx="10" fill="#eea5b4" stroke="#b7778b" strokeWidth="5"/><path d="M623 500H666" stroke="#c4cedb" strokeWidth="11"/></g>{grip}</g>}
    {hand === 'idea-book' && <g className={styles.handAccessory} aria-hidden="true"><g transform="rotate(-12 648 591)"><rect x="575" y="495" width="143" height="188" rx="15" fill="#82c9ba" stroke="#428c89" strokeWidth="6"/><path d="M598 497V680" stroke="#428c89" strokeWidth="8"/><rect x="613" y="521" width="85" height="68" rx="7" fill="#fff4dd"/><path d="M627 541H684M627 554H677M627 567H665" stroke="#afbbba" strokeWidth="5"/><path d="M678 617V687L693 677L704 687V617" fill="#f3b27b"/></g>{grip}</g>}
    {head === 'witch-hat' && <g aria-hidden="true" strokeLinejoin="round"><path d="M309 317Q449 278 625 310L647 347Q470 315 282 362Z" fill="#594584" stroke="#332751" strokeWidth="7"/><path d="M366 308Q393 221 471 137Q530 196 569 301Z" fill="#7053a6" stroke="#332751" strokeWidth="7"/><path d="M470 138Q553 151 561 226Q531 200 501 211" fill="#8f70c1" stroke="#332751" strokeWidth="7"/><path d="M351 303Q458 273 579 296L590 326Q470 302 342 335Z" fill="#f29a4a" stroke="#b9663b" strokeWidth="5"/><rect x="446" y="286" width="45" height="35" rx="6" fill="#ffd776" stroke="#a86632" strokeWidth="5"/><rect x="457" y="294" width="23" height="18" rx="3" fill="#594584"/><path d="M521 233l7 13 15 2-11 10 3 15-14-7-13 7 3-15-11-10 15-2Z" fill="#ffe69a" stroke="#bd8f45" strokeWidth="3"/></g>}
    {head === 'pumpkin-headband' && <g aria-hidden="true" strokeLinejoin="round"><path d="M291 330Q455 279 626 321L626 348Q458 311 292 359Z" fill="#5c477c" stroke="#34294d" strokeWidth="6"/><g transform="translate(0 -4)"><path d="M365 315Q343 271 374 243Q399 223 424 247Q447 223 474 243Q506 273 483 317Z" fill="#f38b3c" stroke="#a84f31" strokeWidth="6"/><path d="M397 248Q381 280 397 313M451 248Q467 280 451 313" fill="none" stroke="#d96734" strokeWidth="5"/><path d="M416 239Q414 218 429 208Q442 223 434 244" fill="#70a867" stroke="#3d6f55" strokeWidth="5"/><path d="M393 281l10-7 10 8M444 282l10-8 10 7M409 296Q425 309 443 296" fill="none" stroke="#613f49" strokeWidth="5" strokeLinecap="round"/></g><g transform="translate(154 4) scale(.72)"><path d="M365 315Q343 271 374 243Q399 223 424 247Q447 223 474 243Q506 273 483 317Z" fill="#f3a24b" stroke="#a84f31" strokeWidth="8"/><path d="M397 248Q381 280 397 313M451 248Q467 280 451 313" fill="none" stroke="#d96734" strokeWidth="7"/><path d="M416 239Q414 218 429 208Q442 223 434 244" fill="#70a867" stroke="#3d6f55" strokeWidth="7"/></g></g>}
    {eyes === 'bat-wing-glasses' && <g aria-hidden="true" strokeLinejoin="round"><g fill="#8c6cc1" fillOpacity=".18" stroke="#493765" strokeWidth="8"><circle cx="390" cy="413" r="50"/><circle cx="558" cy="407" r="47"/><path d="M440 405Q473 383 511 400M340 406L318 397M605 401L628 390" fill="none"/></g><path d="M342 382Q309 345 275 357L289 378L266 391L300 408L280 429Q318 431 343 414Z" fill="#6e55a0" stroke="#3b2e56" strokeWidth="6"/><path d="M605 376Q641 339 674 352L660 373L684 386L651 403L672 424Q634 427 605 409Z" fill="#6e55a0" stroke="#3b2e56" strokeWidth="6"/><path d="M363 389L378 378M531 384L547 374" stroke="#f0e8ff" strokeWidth="5" strokeLinecap="round"/></g>}
    {neck === 'vampire-bow' && <g aria-hidden="true" strokeLinejoin="round"><path d="M353 496Q414 497 481 535Q542 491 602 489L566 566L510 548L478 575L442 548L388 572Z" fill="#51406f" stroke="#302642" strokeWidth="6"/><path d="M379 520Q417 493 476 540Q540 491 577 518L560 585Q525 591 488 555Q439 598 401 582Z" fill="#c74d61" stroke="#7d344a" strokeWidth="6"/><path d="M478 543L421 518M491 543L548 515M479 551L419 576M492 552L548 576" stroke="#ea7181" strokeWidth="5"/><path d="M469 528L493 523L509 544L496 568L470 570L456 547Z" fill="#f0b45d" stroke="#96523d" strokeWidth="5"/><path d="M481 537l5 9 10 2-7 7 2 10-10-5-9 5 2-10-7-7 10-2Z" fill="#fff0a7" stroke="none"/></g>}
    {hand === 'ghost-candy-bag' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><path d="M608 532Q653 477 703 532" fill="none" stroke="#665080" strokeWidth="10" strokeLinecap="round"/><path d="M586 525Q653 500 724 526V654Q704 674 683 655Q663 678 642 656Q620 676 596 655Z" fill="#fff7e9" stroke="#665080" strokeWidth="6"/><path d="M616 525L628 493L645 524" fill="#f0a34c" stroke="#b6633d" strokeWidth="5"/><path d="M672 523L685 489L704 526" fill="#8dd3bd" stroke="#477e75" strokeWidth="5"/><ellipse cx="633" cy="582" rx="9" ry="13" fill="#4e405d"/><ellipse cx="683" cy="582" rx="9" ry="13" fill="#4e405d"/><path d="M641 613Q659 598 677 613Q660 628 641 613Z" fill="#c87a91"/><path d="M606 556Q620 546 632 554M685 550Q700 543 711 554" fill="none" stroke="#e5d5c6" strokeWidth="5" strokeLinecap="round"/>{grip}</g>}
    {hand === 'pumpkin-lantern' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><path d="M604 558Q650 482 708 555" fill="none" stroke="#5b496d" strokeWidth="11" strokeLinecap="round"/><path d="M640 521Q635 494 654 478Q674 493 666 523" fill="#6fa466" stroke="#3c6a50" strokeWidth="6"/><path d="M586 578Q587 531 627 520Q654 505 679 522Q721 530 728 578V648Q691 678 656 659Q622 680 588 650Z" fill="#f08a3f" stroke="#a64e31" strokeWidth="7"/><path d="M625 529Q601 573 624 657M684 531Q709 574 684 657M655 519V664" fill="none" stroke="#d66a34" strokeWidth="6"/><path d="M613 577l20-15 18 18M671 580l19-18 20 15M624 618Q657 646 693 617Q659 631 624 618Z" fill="#4a3648" stroke="#4a3648" strokeWidth="6" strokeLinecap="round"/><path d="M603 547Q650 515 710 548" fill="none" stroke="#ffb85a" strokeWidth="5" opacity=".8"/>{grip}</g>}
    {hand === 'magic-spellbook' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><g transform="rotate(-10 656 585)"><rect x="579" y="490" width="148" height="190" rx="16" fill="#594684" stroke="#312741" strokeWidth="7"/><path d="M599 492V678" stroke="#a987d6" strokeWidth="9"/><path d="M713 506Q728 526 722 658L709 671" fill="none" stroke="#d7c7ee" strokeWidth="8"/><circle cx="658" cy="574" r="47" fill="#312a49" stroke="#82d6b7" strokeWidth="6"/><path d="M658 535l11 23 26 4-19 18 5 26-23-13-24 13 5-26-19-18 26-4Z" fill="#ffe28a" stroke="#d2a94f" strokeWidth="4"/><path d="M625 521Q655 506 686 521M622 633Q656 651 692 633" fill="none" stroke="#bca5de" strokeWidth="5" strokeLinecap="round"/><circle cx="704" cy="542" r="7" fill="#8fe6c8"/><circle cx="610" cy="617" r="6" fill="#f3a45a"/></g>{grip}</g>}
    {head === 'vietnam-conical-hat' && <g aria-hidden="true" strokeLinejoin="round"><path d="M301 304Q387 196 466 135Q548 199 635 308Q470 339 301 304Z" fill="#f3ddb0" stroke="#a97b4e" strokeWidth="7"/><path d="M466 137L397 306M466 137L537 309M466 137V317" fill="none" stroke="#d1ad75" strokeWidth="5"/><path d="M302 304Q465 279 635 308Q474 346 301 304Z" fill="#f9e9c4" stroke="#a97b4e" strokeWidth="7"/><path d="M337 307Q466 289 600 311" fill="none" stroke="#fff5d8" strokeWidth="6" strokeLinecap="round"/><path d="M562 290Q596 275 621 299Q600 324 568 313Z" fill="#d93832" stroke="#9f2c2a" strokeWidth="5"/><path d="M587 306L615 349L583 340L567 364L558 313Z" fill="#e54a43" stroke="#9f2c2a" strokeWidth="5"/></g>}
    {head === 'vietnam-star-headband' && <g aria-hidden="true" strokeLinejoin="round"><path d="M285 329Q454 277 632 319L633 353Q459 310 286 363Z" fill="#da251d" stroke="#941f22" strokeWidth="6"/><path d="M461 294L470 314L492 316L475 331L480 353L461 342L442 353L447 331L430 316L452 314Z" fill="#ffcd00" stroke="#c68e18" strokeWidth="4"/><path d="M311 337Q453 297 609 329" fill="none" stroke="#f26c5f" strokeWidth="5" strokeLinecap="round" opacity=".7"/></g>}
    {eyes === 'lotus-glasses' && <g aria-hidden="true" strokeLinejoin="round"><g fill="#f5a4b5" fillOpacity=".16" stroke="#b94f6d" strokeWidth="8"><circle cx="390" cy="413" r="50"/><circle cx="558" cy="407" r="47"/><path d="M440 405Q474 383 511 400M340 406L318 397M605 401L629 390" fill="none"/></g><g fill="#ef7891" stroke="#ad4865" strokeWidth="5"><path d="M326 385Q294 370 300 340Q327 343 337 369Q336 335 360 323Q377 350 356 381Q383 357 402 373Q389 398 352 402Z"/><path d="M608 379Q633 348 658 354Q659 381 629 395Q665 386 679 408Q653 429 619 405Q641 432 621 449Q595 432 598 400Z"/></g><path d="M365 390L379 379M532 384L547 374" stroke="#fff3f5" strokeWidth="5" strokeLinecap="round"/></g>}
    {neck === 'southern-checkered-scarf' && <g aria-hidden="true" strokeLinejoin="round"><path d="M354 500Q469 535 596 493L519 576L482 548L443 583Z" fill="#eee6d5" stroke="#4a4854" strokeWidth="6"/><path d="M469 543L448 642L484 621L516 644L505 545Z" fill="#e9dfca" stroke="#4a4854" strokeWidth="6"/><path d="M385 511L423 559M432 516L461 565M513 516L548 550M555 505L574 527M460 558L506 627M449 603L492 640" fill="none" stroke="#55515a" strokeWidth="8" opacity=".9"/><path d="M407 519L382 540M458 527L423 560M530 520L500 551M573 509L537 540M463 580L511 551M453 620L510 584" fill="none" stroke="#a99f8d" strokeWidth="5"/><ellipse cx="487" cy="548" rx="22" ry="18" fill="#f5eddd" stroke="#4a4854" strokeWidth="5"/></g>}
    {hand === 'vietnam-national-flag' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><path d="M607 458V697" stroke="#a77445" strokeWidth="12" strokeLinecap="round"/><path d="M607 461H727V541H607Z" fill="#da251d" stroke="#941f22" strokeWidth="5"/><path d="M667 477L672.4 493.6L689.8 493.6L675.7 503.8L681.1 520.4L667 510.2L652.9 520.4L658.3 503.8L644.2 493.6L661.6 493.6Z" fill="#ffcd00"/>{grip}</g>}
    {hand === 'dong-son-drum' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><path d="M603 548Q615 516 651 505Q693 502 717 533L707 650Q650 677 594 646Z" fill="#b9793d" stroke="#74492e" strokeWidth="7"/><ellipse cx="655" cy="536" rx="67" ry="53" fill="#d8a553" stroke="#74492e" strokeWidth="7"/><ellipse cx="655" cy="536" rx="50" ry="39" fill="none" stroke="#8c5b34" strokeWidth="5"/><ellipse cx="655" cy="536" rx="29" ry="23" fill="none" stroke="#8c5b34" strokeWidth="4"/><path d="M655 510L662 526L679 527L666 538L671 554L655 545L640 554L644 538L632 527L649 526Z" fill="#ffe09a" stroke="#8c5b34" strokeWidth="3"/><path d="M604 529L620 535L607 544M704 529L690 536L704 545M625 507L630 521L641 510M679 510L682 523L694 513" fill="none" stroke="#f2cf83" strokeWidth="5" strokeLinecap="round"/><path d="M607 582Q654 601 704 580M603 613Q653 636 709 610" fill="none" stroke="#e7bd71" strokeWidth="5"/>{grip}</g>}
    {hand === 'lotus-lantern' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><path d="M614 684L656 558" stroke="#b7814f" strokeWidth="11" strokeLinecap="round"/><path d="M655 570Q615 545 613 508Q648 512 660 543Q660 494 687 478Q711 509 685 548Q714 514 742 524Q737 563 693 575Q718 578 727 603Q687 620 660 583Q641 615 605 609Q608 582 631 570Z" fill="#eb758f" stroke="#a84866" strokeWidth="6"/><path d="M660 559Q642 529 638 519M669 555Q681 517 686 494M682 561Q712 543 730 540M648 574Q628 590 618 598M676 577Q697 597 714 600" fill="none" stroke="#f7afbb" strokeWidth="5" strokeLinecap="round"/><ellipse cx="665" cy="565" rx="28" ry="21" fill="#ffd36c" stroke="#b87b3c" strokeWidth="5"/><path d="M646 563Q665 545 684 563Q665 582 646 563Z" fill="#fff0a7"/>{grip}</g>}
    {head === 'summer-straw-hat' && <g aria-hidden="true" strokeLinejoin="round"><path d="M365 303Q374 196 457 169Q541 194 560 304Z" fill="#efd18c" stroke="#a87945" strokeWidth="7"/><path d="M383 278Q460 255 546 280L552 315Q466 294 374 318Z" fill="#57c8c7" stroke="#348b91" strokeWidth="5"/><path d="M286 310Q456 267 640 308Q619 356 469 348Q329 359 286 310Z" fill="#f4dc9d" stroke="#a87945" strokeWidth="7"/><path d="M327 314Q459 285 606 313M373 252Q457 225 542 251" fill="none" stroke="#ffeab6" strokeWidth="5" strokeLinecap="round"/><path d="M542 277Q571 247 596 267Q606 293 569 310Q544 315 529 294Z" fill="#f2767b" stroke="#aa4c61" strokeWidth="5"/><circle cx="565" cy="281" r="10" fill="#ffd166"/></g>}
    {head === 'hibiscus-hair-clip' && <g aria-hidden="true" strokeLinejoin="round"><path d="M548 323Q563 276 611 254Q609 299 574 328Z" fill="#6fc29a" stroke="#397b68" strokeWidth="6"/><path d="M585 301Q556 265 579 237Q606 228 620 260Q619 222 650 213Q678 231 660 266Q690 242 712 264Q712 296 675 302Q707 314 699 342Q670 359 646 327Q650 365 619 371Q591 351 607 319Q574 340 554 316Q556 297 585 301Z" fill="#f47d86" stroke="#aa4a61" strokeWidth="6"/><circle cx="632" cy="293" r="24" fill="#ffd269" stroke="#b77b3b" strokeWidth="5"/><path d="M633 293Q674 275 704 283" fill="none" stroke="#ffd269" strokeWidth="8" strokeLinecap="round"/><circle cx="708" cy="282" r="7" fill="#fff0a9"/></g>}
    {eyes === 'ocean-sunglasses' && <g aria-hidden="true" strokeLinejoin="round"><rect x="333" y="365" width="116" height="93" rx="33" fill="#255c78" fillOpacity=".72" stroke="#54cfd1" strokeWidth="9"/><rect x="505" y="359" width="111" height="91" rx="32" fill="#255c78" fillOpacity=".72" stroke="#54cfd1" strokeWidth="9"/><path d="M449 397Q477 379 505 394M333 398L310 389M616 392L639 380" fill="none" stroke="#54cfd1" strokeWidth="8" strokeLinecap="round"/><path d="M354 386L381 374M526 381L552 370" stroke="#d7ffff" strokeWidth="7" strokeLinecap="round" opacity=".85"/><path d="M363 438Q390 421 418 438M533 431Q560 414 589 430" fill="none" stroke="#7ce8df" strokeWidth="5" strokeLinecap="round" opacity=".7"/></g>}
    {neck === 'tropical-flower-lei' && <g aria-hidden="true" strokeLinejoin="round"><path d="M356 505Q472 629 601 496" fill="none" stroke="#3b9578" strokeWidth="10" strokeLinecap="round"/><g transform="translate(392 528)"><circle cy="-15" r="16" fill="#ff8582" stroke="#a94d62" strokeWidth="4"/><circle cx="14" cy="-5" r="16" fill="#ff8582" stroke="#a94d62" strokeWidth="4"/><circle cx="9" cy="12" r="16" fill="#ff8582" stroke="#a94d62" strokeWidth="4"/><circle cx="-9" cy="12" r="16" fill="#ff8582" stroke="#a94d62" strokeWidth="4"/><circle cx="-14" cy="-5" r="16" fill="#ff8582" stroke="#a94d62" strokeWidth="4"/><circle r="10" fill="#ffd76d"/></g><g transform="translate(452 580) scale(.9)"><circle cy="-15" r="16" fill="#ffd36d" stroke="#bd7c3d" strokeWidth="4"/><circle cx="14" cy="-5" r="16" fill="#ffd36d" stroke="#bd7c3d" strokeWidth="4"/><circle cx="9" cy="12" r="16" fill="#ffd36d" stroke="#bd7c3d" strokeWidth="4"/><circle cx="-9" cy="12" r="16" fill="#ffd36d" stroke="#bd7c3d" strokeWidth="4"/><circle cx="-14" cy="-5" r="16" fill="#ffd36d" stroke="#bd7c3d" strokeWidth="4"/><circle r="10" fill="#fff1b0"/></g><g transform="translate(515 577) scale(.9)"><circle cy="-15" r="16" fill="#6ed4cf" stroke="#31858a" strokeWidth="4"/><circle cx="14" cy="-5" r="16" fill="#6ed4cf" stroke="#31858a" strokeWidth="4"/><circle cx="9" cy="12" r="16" fill="#6ed4cf" stroke="#31858a" strokeWidth="4"/><circle cx="-9" cy="12" r="16" fill="#6ed4cf" stroke="#31858a" strokeWidth="4"/><circle cx="-14" cy="-5" r="16" fill="#6ed4cf" stroke="#31858a" strokeWidth="4"/><circle r="10" fill="#ffe17c"/></g><g transform="translate(575 522)"><circle cy="-15" r="16" fill="#f58cba" stroke="#a94f76" strokeWidth="4"/><circle cx="14" cy="-5" r="16" fill="#f58cba" stroke="#a94f76" strokeWidth="4"/><circle cx="9" cy="12" r="16" fill="#f58cba" stroke="#a94f76" strokeWidth="4"/><circle cx="-9" cy="12" r="16" fill="#f58cba" stroke="#a94f76" strokeWidth="4"/><circle cx="-14" cy="-5" r="16" fill="#f58cba" stroke="#a94f76" strokeWidth="4"/><circle r="10" fill="#ffd76d"/></g></g>}
    {hand === 'cool-coconut' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><path d="M681 527L715 454" stroke="#f27f7a" strokeWidth="10" strokeLinecap="round"/><path d="M696 477Q717 445 750 461Q735 492 696 477Z" fill="#ffd36b" stroke="#b87b3c" strokeWidth="5"/><path d="M590 535Q655 500 723 536L707 656Q654 691 602 654Z" fill="#9e693f" stroke="#65442f" strokeWidth="7"/><path d="M591 535Q654 566 723 536Q709 504 652 501Q604 505 591 535Z" fill="#78c58d" stroke="#3d7b61" strokeWidth="7"/><path d="M613 532Q655 547 700 531" fill="none" stroke="#eaf2c2" strokeWidth="10" strokeLinecap="round"/><path d="M625 570Q655 551 687 571M621 604Q653 622 691 603" fill="none" stroke="#c38a54" strokeWidth="5" strokeLinecap="round"/><circle cx="643" cy="521" r="7" fill="#65442f"/><circle cx="667" cy="518" r="7" fill="#65442f"/>{grip}</g>}
    {hand === 'summer-beach-ball' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><circle cx="657" cy="580" r="78" fill="#fff5dc" stroke="#416c82" strokeWidth="7"/><path d="M657 502Q626 531 626 570Q626 621 654 658Q604 651 583 608Q563 562 596 528Q619 505 657 502Z" fill="#f47d7a" stroke="#b44e61" strokeWidth="5"/><path d="M657 502Q697 505 722 536Q744 565 729 603Q714 638 676 654Q696 611 690 573Q685 532 657 502Z" fill="#61d0ca" stroke="#34858c" strokeWidth="5"/><path d="M626 570Q657 545 690 573Q682 613 654 658Q630 627 626 570Z" fill="#ffd267" stroke="#b9823d" strokeWidth="5"/><circle cx="657" cy="542" r="20" fill="#fff4d8" stroke="#416c82" strokeWidth="5"/>{grip}</g>}
    {hand === 'mini-surfboard' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><g transform="rotate(12 655 575)"><path d="M649 456Q699 488 718 561Q730 629 678 704Q618 651 599 581Q589 509 649 456Z" fill="#62d2cf" stroke="#2f7d89" strokeWidth="7"/><path d="M621 497Q654 523 696 516M606 559Q651 591 715 573M614 624Q654 648 699 634" fill="none" stroke="#eafdfa" strokeWidth="9"/><path d="M603 546Q650 519 704 542Q674 560 642 566Q621 566 603 546Z" fill="#ffd26b" stroke="#b87b3e" strokeWidth="5"/><path d="M631 666Q651 636 677 662L678 699Q649 686 631 666Z" fill="#f17d7d" stroke="#a84d61" strokeWidth="5"/></g>{grip}</g>}
  </>;
}

function SetEffects({ setId }: { setId: string | null }) {
  if (setId === 'cosmic-explorer') return <g className={styles.cosmicEffect} aria-hidden="true">
    <ellipse cx="468" cy="455" rx="276" ry="205" fill="none" stroke="#7bd8ff" strokeWidth="4" strokeDasharray="8 18" opacity=".42"/>
    <g className={styles.cosmicOrbiter}><circle cx="719" cy="375" r="18" fill="#9cecff" stroke="#4c9ed0" strokeWidth="4"/><path d="M692 374Q719 353 747 375" fill="none" stroke="#fff0aa" strokeWidth="6" strokeLinecap="round"/></g>
    <path d="M250 319l7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2Z" fill="#fff0a9" opacity=".9"/>
    <path d="M700 614l5 10 12 2-9 8 2 12-10-6-11 6 3-12-9-8 12-2Z" fill="#d7c6ff" opacity=".78"/>
    <circle cx="229" cy="584" r="7" fill="#9cecff"/><circle cx="694" cy="274" r="6" fill="#fff" opacity=".8"/>
  </g>;

  if (setId === 'dino-dreamer') return <g className={styles.dinoDreamEffect} aria-hidden="true">
    <g className={styles.dreamBubble}><circle cx="693" cy="294" r="23" fill="#c9f5df" opacity=".28" stroke="#b6ead3" strokeWidth="4"/><circle cx="731" cy="248" r="13" fill="#dff9ec" opacity=".42"/></g>
    <path d="M239 364l6 12 13 2-10 9 3 14-12-7-12 7 3-14-10-9 13-2Z" fill="#e6d4ff" opacity=".7"/>
    <path d="M699 603Q719 582 740 603Q720 625 699 603Z" fill="#ffc4d9" opacity=".55"/>
    <circle cx="245" cy="606" r="10" fill="#baf0d3" opacity=".52"/>
  </g>;

  if (setId === 'snowy-christmas') return <g className={styles.snowEffect} aria-hidden="true">
    {[[255, 300, 13], [690, 277, 15], [730, 470, 11], [235, 552, 10], [674, 650, 12]].map(([x, y, size], index) => <g key={index} transform={`translate(${x} ${y}) scale(${size / 15})`} stroke="#dff6ff" strokeWidth="5" strokeLinecap="round" opacity=".8"><path d="M0-15V15M-13-7L13 7M-13 7L13-7"/><circle r="3" fill="#fff" stroke="none"/></g>)}
    <circle cx="316" cy="249" r="5" fill="#fff" opacity=".65"/><circle cx="620" cy="211" r="7" fill="#dff6ff" opacity=".7"/><circle cx="758" cy="575" r="5" fill="#fff" opacity=".6"/>
  </g>;

  return null;
}

function SetCharacterFace({ skin }: { skin: FlytieeSkin }) {
  return <>
    <path d="M365 360Q389 341 414 357M520 354Q546 336 572 355" fill="none" stroke={skin.palette.brow} strokeWidth="7" strokeLinecap="round"/>
    <g className={styles.setEyes}>
      <ellipse cx="397" cy="411" rx="40" ry="49" fill="#fffef8"/><ellipse cx="548" cy="405" rx="39" ry="48" fill="#fffef8"/>
      <ellipse cx="405" cy="419" rx="23" ry="31" fill={skin.palette.eye}/><ellipse cx="556" cy="413" rx="22" ry="30" fill={skin.palette.eye}/>
      <ellipse cx="398" cy="398" rx="9" ry="12" fill="#fff"/><ellipse cx="544" cy="393" rx="9" ry="12" fill="#fff"/>
      <circle cx="415" cy="424" r="4" fill="#fff"/><circle cx="561" cy="419" r="4" fill="#fff"/>
    </g>
    <g className={styles.setClosedEyes} fill="none" stroke="#2f3e67" strokeWidth="9" strokeLinecap="round"><path d="M366 412Q397 441 429 410M511 406Q543 435 575 404"/></g>
    <ellipse cx="354" cy="466" rx="25" ry="13" fill={skin.palette.cheek} opacity=".82"/><ellipse cx="593" cy="455" rx="24" ry="13" fill={skin.palette.cheek} opacity=".82"/>
    <g className={styles.setBeak}><path d="M442 462Q466 440 492 460Q469 482 442 462Z" fill="#ffd27b" stroke="#d28c42" strokeWidth="5"/><path d="M447 469Q468 492 488 469" fill="#d98643" stroke="#b96f39" strokeWidth="4"/></g>
  </>;
}

function NaturalSetBase({ skin, gradientId }: { skin: FlytieeSkin; gradientId: string }) {
  return <>
    <g fill="#f4b66b" stroke="#d48a45" strokeWidth="5" strokeLinejoin="round"><path d="M365 696C351 711 350 731 338 739C327 747 329 757 342 758H390C408 757 405 744 391 739L390 701Z"/><path d="M510 702L514 739C500 748 505 758 519 758H564C580 757 579 748 565 740L546 696Z"/></g>
    <g className={styles.waveWing}><path d="M593 493C637 468 661 429 683 387C694 366 709 376 707 394L702 421C724 399 739 410 728 431L717 451C740 438 751 452 732 471C756 465 760 480 741 496C710 526 663 551 613 547Z" fill={skin.palette.bodyMid} stroke={skin.palette.outline} strokeWidth="6"/></g>
    <path d="M366 267C342 239 338 217 350 203C363 189 389 210 413 237C407 201 416 175 433 173C452 171 461 206 463 236C480 213 500 205 511 218C520 230 507 253 491 267C609 285 671 396 666 532C663 663 595 730 467 735C340 741 240 695 226 576C209 433 251 303 366 267Z" fill={`url(#${gradientId}-body)`} stroke={skin.palette.outline} strokeWidth="7"/>
    <path d="M296 362C321 326 345 312 370 303M421 244C422 226 424 214 429 205" stroke={skin.palette.highlight} strokeWidth="12" strokeLinecap="round" opacity=".65"/>
    <g className={styles.restWing}><path d="M267 432C241 444 228 479 234 521C239 561 259 588 294 606C310 614 322 606 319 592C315 577 298 557 295 536C293 511 308 484 302 460C298 442 284 429 267 432Z" fill={skin.palette.bodyEnd} stroke={skin.palette.outline} strokeWidth="6"/><path d="M262 478C253 511 271 548 289 561" stroke={skin.palette.highlight} strokeWidth="8" strokeLinecap="round"/></g>
    <SetCharacterFace skin={skin}/>
  </>;
}

function EventSetCharacter({ setId, skin, gradientId }: { setId: string; skin: FlytieeSkin; gradientId: string }) {
  return <g className={styles.fullSetCharacter} strokeLinejoin="round">
    <NaturalSetBase skin={skin} gradientId={gradientId}/>

    {setId === 'cosmic-explorer' && <>
      <path d="M316 511Q462 548 620 510L613 660Q596 703 535 719Q465 737 391 716Q332 699 318 657Z" fill="#f5f9fc" stroke="#6f8da9" strokeWidth="8"/>
      <path d="M350 550Q464 577 583 548L578 660Q527 688 464 687Q401 686 352 657Z" fill="#dfeaf2" stroke="#a4b8ca" strokeWidth="5"/>
      <path d="M416 538H514V625H416Z" fill="#263c5d" stroke="#66829e" strokeWidth="6"/><rect x="435" y="552" width="60" height="27" rx="7" fill="#6fe2ee"/><circle cx="439" cy="602" r="8" fill="#f17478"/><circle cx="466" cy="602" r="8" fill="#f5cf66"/><circle cx="493" cy="602" r="8" fill="#70d5a4"/>
      <path d="M323 506Q463 551 620 507" fill="none" stroke="#c8e6ef" strokeWidth="17" strokeLinecap="round"/>
      <path d="M345 689L331 745Q360 769 409 752L414 700M521 700L526 753Q571 770 601 744L584 686" fill="#e5edf3" stroke="#6f8da9" strokeWidth="7"/>
      <path d="M323 741Q367 725 414 746L411 768H322Z" fill="#567699" stroke="#34516f" strokeWidth="6"/><path d="M520 745Q561 727 605 744L608 768H520Z" fill="#567699" stroke="#34516f" strokeWidth="6"/>
      <path d="M315 322Q395 285 497 292Q564 296 618 327" fill="none" stroke="#f4f8fb" strokeWidth="18" strokeLinecap="round"/><path d="M568 285V247Q568 224 588 218" fill="none" stroke="#6f8da9" strokeWidth="7" strokeLinecap="round"/><circle cx="591" cy="216" r="17" fill="#6fe2ee" stroke="#3f7fa0" strokeWidth="5"/><path d="M584 209l6 12 13 2-10 9 3 13-12-6-12 6 3-13-10-9 13-2Z" fill="#fff3a6"/>
    </>}

    {setId === 'dino-dreamer' && <>
      <path d="M603 586Q697 596 713 657Q670 638 621 679L578 651Z" fill="#75c59f" stroke="#3d8e75" strokeWidth="8"/><path d="M688 632l24-6-16 21 16 15-25 0" fill="#fff1bd" stroke="#bea260" strokeWidth="4"/>
      <path d="M313 508Q462 548 621 508L613 662Q594 704 535 721Q463 740 390 717Q332 697 316 657Z" fill="#8fd6b5" stroke="#3d8e75" strokeWidth="8"/>
      <ellipse cx="467" cy="620" rx="102" ry="91" fill="#dff6d5" stroke="#68aa77" strokeWidth="6"/>
      <path d="M320 507Q462 552 618 506" fill="none" stroke="#effff5" strokeWidth="17" strokeLinecap="round"/>
      <path d="M344 691L331 746Q361 769 411 752L416 702M520 703L525 753Q573 770 603 744L582 688" fill="#75c59f" stroke="#3d8e75" strokeWidth="7"/>
      <path d="M322 742Q367 726 415 748L411 769H321Z" fill="#c9efd8" stroke="#3d8e75" strokeWidth="6"/><path d="M519 747Q559 727 607 745L609 769H519Z" fill="#c9efd8" stroke="#3d8e75" strokeWidth="6"/>
      <path d="M342 300Q382 258 428 269L465 216L496 270Q547 261 589 302Q528 282 465 286Q400 284 342 300Z" fill="#8fd6b5" stroke="#3d8e75" strokeWidth="7"/>
      <path d="M378 276l19-42 25 39 42-58 31 58 34-41 20 49" fill="#c8efd5" stroke="#5bae8d" strokeWidth="6" strokeLinejoin="round"/>
    </>}

    {setId === 'snowy-christmas' && <>
      <path d="M314 508Q461 548 621 508L615 660Q597 703 535 721Q463 740 389 717Q331 698 316 657Z" fill="#dc4658" stroke="#922f43" strokeWidth="8"/>
      <path d="M320 507Q461 552 618 506" fill="none" stroke="#fffaf0" strokeWidth="18" strokeLinecap="round"/>
      <path d="M312 628Q464 657 620 626L617 668Q464 702 315 670Z" fill="#263040" stroke="#111827" strokeWidth="6"/><rect x="440" y="637" width="53" height="43" rx="8" fill="#f2c65d" stroke="#a9782f" strokeWidth="6"/><rect x="454" y="648" width="25" height="19" rx="4" fill="#263040"/>
      <path d="M342 688L329 745Q358 770 411 752L417 702M519 702L525 753Q575 770 605 744L582 687" fill="#b72f45" stroke="#7d2638" strokeWidth="7"/>
      <path d="M320 742Q365 725 415 748L411 770H319Z" fill="#cf3c50" stroke="#7d2638" strokeWidth="6"/><path d="M518 747Q559 726 609 745L612 770H518Z" fill="#cf3c50" stroke="#7d2638" strokeWidth="6"/>
      <path d="M390 515Q462 565 535 513L519 580L466 557L414 585L406 520Z" fill="#2f946f" stroke="#1e654e" strokeWidth="7"/><circle cx="466" cy="548" r="15" fill="#f4ce68" stroke="#a97931" strokeWidth="5"/>
      <path d="M296 319Q408 267 548 296Q592 305 625 326L619 363Q457 326 293 372Z" fill="#dc4658" stroke="#922f43" strokeWidth="8"/>
      <path d="M294 355Q458 316 623 347" fill="none" stroke="#fffaf0" strokeWidth="19" strokeLinecap="round"/>
      <path d="M564 292Q607 238 649 263Q682 285 654 320Q636 341 617 348" fill="#dc4658" stroke="#922f43" strokeWidth="7"/><circle cx="651" cy="264" r="27" fill="#fffaf0" stroke="#cfdee1" strokeWidth="6"/>
    </>}
  </g>;
}

function DefaultFace({ skin }: { skin: FlytieeSkin }) {
  const { mood, palette } = skin;
  const browPaths: Record<FlytieeSkin['mood'], [string, string]> = {
    friendly: ['M365 360C379 350 394 352 405 359', 'M545 352C558 343 575 347 585 357'],
    gentle: ['M360 361Q385 342 410 358', 'M539 355Q563 338 588 356'],
    bright: ['M360 356Q385 337 409 354', 'M539 349Q564 330 589 351'],
    curious: ['M359 350Q384 333 409 350', 'M541 367Q563 353 586 364'],
    stern: ['M357 343L410 363', 'M539 363L590 341'],
    dreamy: ['M361 363Q385 349 409 360', 'M540 357Q563 344 587 356'],
  };
  const [leftBrow, rightBrow] = browPaths[mood];
  const pupil = mood === 'curious'
    ? { lx: 407, ly: 407, rx: 574, ry: 400, lrx: 22, lry: 29, rrx: 20, rry: 27 }
    : mood === 'stern'
      ? { lx: 400, ly: 420, rx: 567, ry: 414, lrx: 22, lry: 25, rrx: 20, rry: 24 }
      : mood === 'dreamy'
        ? { lx: 399, ly: 425, rx: 567, ry: 419, lrx: 22, lry: 27, rrx: 20, rry: 26 }
        : mood === 'bright'
          ? { lx: 400, ly: 417, rx: 568, ry: 411, lrx: 25, lry: 33, rrx: 23, rry: 31 }
          : { lx: 400, ly: 419, rx: 568, ry: 413, lrx: 23, lry: 31, rrx: 21, rry: 29 };

  return <>
    <g className={styles.brows} stroke={palette.brow} strokeWidth={mood === 'stern' ? 9 : 7} strokeLinecap="round" fill="none">
      <path d={leftBrow}/><path d={rightBrow}/>
    </g>
    <g className={styles.eyes}>
      <ellipse cx="388" cy="412" rx="39" ry="48" fill="#fffef7"/>
      <ellipse cx="559" cy="406" rx="35" ry="45" fill="#fffef7"/>
      <ellipse cx={pupil.lx} cy={pupil.ly} rx={pupil.lrx} ry={pupil.lry} fill={palette.eye}/>
      <ellipse cx={pupil.rx} cy={pupil.ry} rx={pupil.rrx} ry={pupil.rry} fill={palette.eye}/>
      <ellipse cx={pupil.lx - 6} cy={pupil.ly - 15} rx="9" ry="11" fill="#fff"/>
      <ellipse cx={pupil.rx - 6} cy={pupil.ry - 14} rx="8" ry="10" fill="#fff"/>
      <circle cx={pupil.lx + 10} cy={pupil.ly + 7} r="4" fill="#fff"/>
      <circle cx={pupil.rx + 9} cy={pupil.ry + 6} r="3.5" fill="#fff"/>
      {mood === 'gentle' && <><path d="M351 391Q344 380 338 372M594 384Q603 373 608 364" stroke={palette.brow} strokeWidth="5" strokeLinecap="round"/><circle cx="425" cy="382" r="5" fill={palette.accent}/></>}
      {mood === 'bright' && <><path d="M420 385l4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1Z" fill="#fff4b3"/><path d="M588 374l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#fff4b3"/></>}
      {mood === 'stern' && <><path d="M351 393Q389 375 427 401M525 399Q559 374 594 390" fill={palette.bodyMid} stroke={palette.outline} strokeWidth="6"/><path d="M355 399Q389 390 424 404M529 403Q559 389 591 395" fill="none" stroke={palette.outline} strokeWidth="4"/></>}
      {mood === 'dreamy' && <><path d="M351 397Q388 376 426 400M526 391Q560 372 594 394" fill={palette.bodyStart} stroke={palette.outline} strokeWidth="5"/><path d="M425 377l4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1Z" fill={palette.accent}/></>}
    </g>
  </>;
}

function BirdScene({ mood, profile, gradientId, className }: { mood: FlytieeMood; profile: FlytieeProfile; gradientId: string; className?: string }) {
  const skin = getFlytieeSkin(profile.equippedSkinId);
  const setId = profile.equippedSetId;
  return <g className={cn(styles.scene, className)} data-mood={mood} data-held={!setId && Boolean(profile.equipped.hand) ? 'true' : 'false'} data-skin={skin.id} data-set={setId ?? 'none'}>
    <SetEffects setId={setId}/>
    <ellipse cx="454" cy="760" rx="170" ry="18" fill="#7b84ae" opacity=".17"/>
    {setId ? <g className={styles.body}><EventSetCharacter setId={setId} skin={skin} gradientId={gradientId}/></g> : <g className={styles.body}>
      <g fill="#f4b66b" stroke="#d48a45" strokeWidth="5" strokeLinejoin="round"><path d="M365 696C351 711 350 731 338 739C327 747 329 757 342 758H390C408 757 405 744 391 739L390 701Z"/><path d="M510 702L514 739C500 748 505 758 519 758H564C580 757 579 748 565 740L546 696Z"/></g>
      <g className={styles.waveWing}><path d="M593 493C637 468 661 429 683 387C694 366 709 376 707 394L702 421C724 399 739 410 728 431L717 451C740 438 751 452 732 471C756 465 760 480 741 496C710 526 663 551 613 547Z" fill={skin.palette.bodyMid} stroke={skin.palette.outline} strokeWidth="6" strokeLinejoin="round"/></g>
      <path d="M366 267C342 239 338 217 350 203C363 189 389 210 413 237C407 201 416 175 433 173C452 171 461 206 463 236C480 213 500 205 511 218C520 230 507 253 491 267C609 285 671 396 666 532C663 663 595 730 467 735C340 741 240 695 226 576C209 433 251 303 366 267Z" fill={`url(#${gradientId}-body)`} stroke={skin.palette.outline} strokeWidth="7"/>
      <path d="M296 362C321 326 345 312 370 303M421 244C422 226 424 214 429 205" stroke={skin.palette.highlight} strokeWidth="12" strokeLinecap="round" opacity=".65"/>
      <path d="M472 484C491 465 504 459 519 462C532 466 542 478 550 493C611 519 626 569 614 624C601 687 545 714 466 713C378 712 322 680 318 624C314 565 349 523 411 505C436 498 454 491 472 484Z" fill={`url(#${gradientId}-belly)`}/>
      <path d="M413 645C442 658 475 659 501 650" stroke="#e3d5bd" strokeWidth="5" strokeLinecap="round"/>
      <g className={styles.restWing}><path d="M267 432C241 444 228 479 234 521C239 561 259 588 294 606C310 614 322 606 319 592C315 577 298 557 295 536C293 511 308 484 302 460C298 442 284 429 267 432Z" fill={skin.palette.bodyEnd} stroke={skin.palette.outline} strokeWidth="6"/><path d="M262 478C253 511 271 548 289 561" stroke={skin.palette.highlight} strokeWidth="8" strokeLinecap="round"/></g>
      <DefaultFace skin={skin}/>
      <g className={styles.closedEyes} fill="none" stroke="#35446d" strokeWidth="9" strokeLinecap="round"><path d="M360 416Q388 444 420 414M532 410Q558 436 585 408"/></g>
      <ellipse cx="356" cy="465" rx="27" ry="14" fill={skin.palette.cheek} opacity=".8"/><ellipse cx="598" cy="454" rx="23" ry="13" fill={skin.palette.cheek} opacity=".8"/>
      <g className={styles.beak}><path d="M482 477C490 502 516 508 531 480" fill="#d98643" stroke="#bc733e" strokeWidth="4"/><path d="M477 466C482 452 496 445 508 446C521 446 538 456 542 465C545 474 528 481 511 483C493 484 474 478 477 466Z" fill="#ffd482" stroke="#d4954d" strokeWidth="4"/><path d="M492 460C498 456 505 455 511 456" stroke="#ffebc0" strokeWidth="6" strokeLinecap="round"/></g>

      <g className={cn(styles.expression, styles.faceHungry)}><path d="M356 364Q384 365 407 344M539 343Q560 364 586 361" stroke="#4f5da4" strokeWidth="8" strokeLinecap="round"/><g className={styles.hungryGaze}><path d="M351 404Q389 421 428 397C431 442 414 458 391 458C366 458 351 440 351 404Z" fill="#fffef7"/><path d="M526 396Q558 414 594 392C596 434 583 450 560 451C538 451 526 434 526 396Z" fill="#fffef7"/><ellipse cx="394" cy="433" rx="20" ry="23" fill="#283559"/><ellipse cx="563" cy="426" rx="18" ry="22" fill="#283559"/><ellipse cx="388" cy="422" rx="7" ry="9" fill="#fff"/><ellipse cx="558" cy="416" rx="7" ry="8" fill="#fff"/><path d="M351 404Q389 421 428 397M526 396Q558 414 594 392" stroke="#5868b4" strokeWidth="7" strokeLinecap="round"/></g><ellipse cx="508" cy="480" rx="19" ry="27" fill="#754c48" stroke="#d4954d" strokeWidth="7"/><path d="M497 497Q508 484 519 497" fill="#ee9b9f"/><path d="M480 463Q506 440 534 463Q510 480 480 463Z" fill="#ffd482" stroke="#d4954d" strokeWidth="4"/></g>

      <g className={cn(styles.expression, styles.faceScratch)}><path d="M354 348Q380 330 408 342M541 372L582 360" stroke={skin.palette.brow} strokeWidth="8" strokeLinecap="round"/><ellipse cx="388" cy="407" rx="38" ry="48" fill="#fffef7"/><path d="M527 401Q559 383 591 398Q588 444 558 443Q531 442 527 401Z" fill="#fffef7"/><g className={styles.thinkingGaze}><ellipse cx="400" cy="393" rx="20" ry="27" fill={skin.palette.eye}/><ellipse cx="569" cy="407" rx="17" ry="24" fill={skin.palette.eye}/><circle cx="394" cy="382" r="8" fill="#fff"/><circle cx="564" cy="397" r="7" fill="#fff"/></g><path d="M527 401Q559 383 591 398" stroke={skin.palette.outline} strokeWidth="6" strokeLinecap="round"/><path d="M482 465Q507 445 536 462Q521 482 493 479Z" fill="#ffd482" stroke="#d4954d" strokeWidth="4"/><path d="M494 480Q512 474 529 480" stroke="#92653f" strokeWidth="5" strokeLinecap="round"/><g className={styles.scratchHand}><path d="M628 522C660 492 668 446 652 401L637 353C632 338 620 341 621 355L624 374L609 350C601 339 589 345 596 359L608 382L590 369C578 361 570 371 580 382L612 418C621 447 604 480 601 494Z" fill={skin.palette.bodyMid} stroke={skin.palette.outline} strokeWidth="6" strokeLinejoin="round"/><path d="M623 418Q640 455 625 480" stroke={skin.palette.highlight} strokeWidth="7" strokeLinecap="round"/></g></g>

      <g className={cn(styles.expression, styles.faceHappy)}><path d="M363 348Q386 334 408 346M540 342Q561 328 582 342" stroke="#4f5da4" strokeWidth="7" strokeLinecap="round"/><path d="M356 422Q386 369 420 418M531 414Q560 366 589 409" stroke="#283559" strokeWidth="11" strokeLinecap="round"/><ellipse cx="349" cy="461" rx="31" ry="18" fill="#efa9ba"/><ellipse cx="600" cy="451" rx="27" ry="17" fill="#efa9ba"/><path d="M481 473Q509 465 539 470C535 516 492 523 481 473Z" fill="#754c48" stroke="#d4954d" strokeWidth="5"/><path d="M494 504Q510 483 528 500Q514 518 494 504Z" fill="#f1a0aa"/><path d="M476 464Q508 438 542 461Q512 480 476 464Z" fill="#ffd482" stroke="#d4954d" strokeWidth="4"/></g>

      <g className={cn(styles.expression, styles.faceEat)}><path d="M364 354Q387 345 407 353M539 347Q561 339 583 349" stroke="#4f5da4" strokeWidth="7" strokeLinecap="round"/><path d="M358 421Q388 384 419 416M533 414Q558 381 587 409" stroke="#283559" strokeWidth="10" strokeLinecap="round"/><g className={styles.chewingCheeks}><ellipse cx="371" cy="475" rx="41" ry="29" fill="#a5b0fc"/><ellipse cx="587" cy="467" rx="36" ry="27" fill="#a5b0fc"/><ellipse cx="364" cy="471" rx="26" ry="15" fill="#efa9ba"/><ellipse cx="594" cy="463" rx="24" ry="14" fill="#efa9ba"/></g><g className={styles.chewingMouth}><ellipse cx="510" cy="481" rx="15" ry="20" fill="#754c48" stroke="#d4954d" strokeWidth="5"/><path d="M478 463Q507 440 539 461Q511 482 478 463Z" fill="#ffd482" stroke="#d4954d" strokeWidth="4"/></g><g fill="#eeb66f"><circle cx="478" cy="495" r="4"/><circle cx="544" cy="487" r="5"/><circle cx="538" cy="502" r="3"/></g></g>

      <g className={styles.hungryLines} stroke="#d39b5b" strokeWidth="5" fill="none" strokeLinecap="round"><path d="M382 576q-15 18 0 34M367 567q-24 27 0 53M552 576q15 18 0 34M567 567q24 27 0 53"/></g>
      <g className={styles.scratchMarks} stroke="#b1bbff" strokeWidth="6" strokeLinecap="round"><path d="M659 334l20-18M668 351l24-3"/></g>
      <g className={styles.food} fill="#eeb66f" stroke="#c18746" strokeWidth="3"><ellipse cx="504" cy="515" rx="9" ry="14"/><ellipse cx="528" cy="536" rx="8" ry="12"/></g>
      <g className={styles.sneezePuff} stroke="#bac9f7" strokeWidth="6" strokeLinecap="round"><path d="M551 475L586 465M555 488L594 489M550 500L582 516"/></g>
      <g className={styles.flyingAir} stroke="#acb9ef" strokeWidth="5" strokeLinecap="round"><path d="M254 643Q273 651 290 644M628 649Q649 657 667 648M281 681H305M612 684H637"/></g>
      <AccessoryLayers equipped={profile.equipped} skin={skin}/>
    </g>}
    <g className={styles.sleepZ}><text x="650" y="340">z</text><text x="689" y="289">Z</text><text x="729" y="235">Z</text></g>
  </g>;
}

export function FlytieeAccessoryPreview({ item }: { item: FlytieeAccessory }) {
  const frames = { head: '235 115 485 270', eyes: '295 330 355 160', neck: '330 480 280 180', hand: '550 440 220 290' };
  return <svg viewBox={frames[item.slot]} className="h-28 w-full sm:h-32" fill="none" role="img" aria-label={item.name}><AccessoryLayers equipped={{ [item.slot]: item.id }} skin={getFlytieeSkin('classic')} showGrip={false}/></svg>;
}

export function FlytieeBird({ mood, profile, className }: FlytieeBirdProps) {
  const gradientId = useId().replace(/:/g, '');
  const skin = getFlytieeSkin(profile.equippedSkinId);
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
    <defs><linearGradient id={`${gradientId}-body`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={skin.palette.bodyStart}/><stop offset=".5" stopColor={skin.palette.bodyMid}/><stop offset="1" stopColor={skin.palette.bodyEnd}/></linearGradient><linearGradient id={`${gradientId}-belly`} x2="0" y2="1"><stop stopColor={skin.palette.bellyStart}/><stop offset="1" stopColor={skin.palette.bellyEnd}/></linearGradient></defs>
    {previousMood && <BirdScene key={`${previousMood}-out`} mood={previousMood} profile={profile} gradientId={gradientId} className={cn(styles.sceneExit, longTransition && styles.sceneTransitionLong)}/>}
    <BirdScene key={`${visibleMood}-in`} mood={visibleMood} profile={profile} gradientId={gradientId} className={cn(previousMood && styles.sceneEnter, longTransition && styles.sceneTransitionLong)}/>
  </svg>;
}
