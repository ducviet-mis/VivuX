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

const SHADOW_NINJA_SKIN: FlytieeSkin = {
  id: 'shadow-ninja',
  name: 'Ninja Hắc Ám',
  price: 0,
  description: 'Sắc tím huyền bí của chiến binh nguyệt thực.',
  personality: 'Bí ẩn',
  mood: 'stern',
  palette: {
    bodyStart: '#b79aff', bodyMid: '#65439d', bodyEnd: '#1b122d',
    outline: '#150d26', highlight: '#decfff', bellyStart: '#f0e9ff',
    bellyEnd: '#b9a7db', cheek: '#b978bd', eye: '#201435',
    brow: '#25153f', accent: '#c3a6ff',
  },
};

const MUSHROOM_KINGDOM_SKIN: FlytieeSkin = {
  id: 'mushroom-kingdom',
  name: 'Vương quốc Nấm Ma Thuật',
  price: 0,
  description: 'Sắc tím than huyền ảo của người bảo hộ khu rừng nấm.',
  personality: 'Tinh nghịch',
  mood: 'curious',
  palette: {
    bodyStart: '#b99aff', bodyMid: '#64478d', bodyEnd: '#1d1530',
    outline: '#160d25', highlight: '#e5d7ff', bellyStart: '#f6edff',
    bellyEnd: '#c8b3df', cheek: '#d77a9b', eye: '#251940',
    brow: '#32204e', accent: '#ffcf72',
  },
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
    {head === 'tet-khan-dong' && <g aria-hidden="true" strokeLinejoin="round"><path d="M320 309Q455 272 605 307L611 350Q461 316 313 359Z" fill="#b92831" stroke="#781f2c" strokeWidth="7"/><path d="M362 303Q373 225 420 187Q466 150 515 187Q563 225 574 303Q470 283 362 303Z" fill="#cf3540" stroke="#781f2c" strokeWidth="7"/><path d="M391 286Q402 226 432 205Q466 177 502 205Q535 231 545 289" fill="none" stroke="#f1b94f" strokeWidth="10" strokeLinecap="round"/><path d="M421 278Q432 231 466 214Q500 231 511 280" fill="none" stroke="#f06b62" strokeWidth="13" strokeLinecap="round"/><path d="M334 318Q458 287 590 316" fill="none" stroke="#f3c866" strokeWidth="8" strokeLinecap="round"/><path d="M466 300l9 18 20 3-15 14 4 20-18-10-18 10 4-20-15-14 20-3Z" fill="#ffd66f" stroke="#a96d2e" strokeWidth="4"/><path d="M376 324Q391 308 406 324M526 322Q541 307 557 322" fill="none" stroke="#ffd980" strokeWidth="5" strokeLinecap="round"/></g>}
    {head === 'tet-peach-headdress' && <g aria-hidden="true" strokeLinejoin="round"><path d="M294 330Q454 280 625 321L627 353Q456 314 294 362Z" fill="#c9363f" stroke="#822434" strokeWidth="7"/><path d="M317 337Q455 299 604 329" fill="none" stroke="#f2bd55" strokeWidth="7" strokeLinecap="round"/><path d="M331 326Q344 295 372 282Q397 297 402 326Q414 292 445 281Q472 299 474 330" fill="#e6535b" stroke="#8d2937" strokeWidth="6"/><path d="M360 314Q373 296 387 314M429 311Q443 293 457 314" fill="none" stroke="#ffc96d" strokeWidth="5" strokeLinecap="round"/><g transform="translate(566 285)"><path d="M0 0Q-25-31-48-11Q-60 12-30 28Q-59 38-51 65Q-30 84-7 55Q3 88 31 80Q53 63 35 36Q68 37 72 9Q62-19 31-5Q23-38-4-35Q-30-27 0 0Z" fill="#f28b9d" stroke="#a9425f" strokeWidth="6"/><circle cx="9" cy="25" r="17" fill="#ffd46b" stroke="#ad7335" strokeWidth="5"/></g><path d="M570 312Q603 292 630 303" fill="none" stroke="#72a567" strokeWidth="7" strokeLinecap="round"/></g>}
    {eyes === 'tet-apricot-glasses' && <g aria-hidden="true" strokeLinejoin="round"><g fill="#ffe4a0" fillOpacity=".12" stroke="#d99a2f" strokeWidth="8"><circle cx="390" cy="413" r="50"/><circle cx="558" cy="407" r="47"/><path d="M440 405Q474 383 511 400M340 406L317 397M605 401L629 390" fill="none"/></g><g fill="#ffd45f" stroke="#b77b2c" strokeWidth="4"><path d="M322 382Q293 366 302 341Q326 340 337 363Q334 333 357 326Q378 341 361 370Q383 354 401 370Q392 394 360 397Q377 420 359 437Q334 433 333 401Q315 425 293 413Q286 388 322 382Z"/><path d="M606 376Q626 348 650 355Q659 378 635 394Q666 383 679 404Q667 429 637 415Q654 441 633 455Q606 448 610 416Q588 438 569 420Q569 394 606 376Z"/></g><circle cx="347" cy="386" r="11" fill="#fff1af"/><circle cx="625" cy="397" r="11" fill="#fff1af"/><path d="M365 390L379 379M532 384L547 374" stroke="#fff7d1" strokeWidth="5" strokeLinecap="round"/></g>}
    {neck === 'tet-lucky-coin-necklace' && <g aria-hidden="true" strokeLinejoin="round"><path d="M357 503Q468 616 596 497" fill="none" stroke="#b92e38" strokeWidth="10" strokeLinecap="round"/><path d="M379 514Q468 590 573 509" fill="none" stroke="#f05e58" strokeWidth="5" strokeDasharray="10 12"/><g fill="#f2be4f" stroke="#a66b28" strokeWidth="5"><circle cx="430" cy="555" r="28"/><circle cx="487" cy="583" r="34"/><circle cx="546" cy="551" r="28"/></g><g fill="#9a5e27"><rect x="420" y="545" width="20" height="20" rx="3"/><rect x="475" y="571" width="24" height="24" rx="4"/><rect x="536" y="541" width="20" height="20" rx="3"/></g><path d="M487 615V664M474 624L487 641L500 624M474 645L487 662L500 645" fill="none" stroke="#c8323d" strokeWidth="8" strokeLinecap="round"/></g>}
    {neck === 'tet-brocade-scarf' && <g aria-hidden="true" strokeLinejoin="round"><path d="M351 498Q469 540 600 493L523 574L485 550L442 584Z" fill="#b82f3a" stroke="#762331" strokeWidth="7"/><path d="M470 544L451 654L486 628L520 652L505 544Z" fill="#c93b43" stroke="#762331" strokeWidth="7"/><path d="M383 511Q469 544 571 507M407 529Q465 557 543 523" fill="none" stroke="#f1bd55" strokeWidth="6" strokeLinecap="round"/><path d="M465 565Q486 543 507 565Q486 588 465 565ZM466 609Q486 589 507 610Q486 632 466 609Z" fill="#f5cc6a" stroke="#9b632a" strokeWidth="4"/><path d="M420 513l8 14 16 2-12 11 3 16-15-8-14 8 3-16-12-11 16-2ZM539 507l8 14 16 2-12 11 3 16-15-8-14 8 3-16-12-11 16-2Z" fill="#ffd977" stroke="#9b632a" strokeWidth="3"/></g>}
    {hand === 'tet-peach-branch' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><path d="M604 689Q629 630 651 575Q679 517 719 466" fill="none" stroke="#7c4a32" strokeWidth="13" strokeLinecap="round"/><path d="M647 581Q616 535 602 497M676 534Q712 521 736 492M632 622Q607 602 585 585" fill="none" stroke="#8d5637" strokeWidth="9" strokeLinecap="round"/><g fill="#f58b9b" stroke="#a5435e" strokeWidth="5"><path d="M585 490Q570 463 590 449Q610 449 616 470Q626 448 647 454Q663 471 646 490Q669 495 668 518Q654 537 632 523Q629 547 607 549Q586 537 593 516Q569 520 561 499Q565 480 585 490Z"/><path d="M704 475Q691 450 710 438Q730 440 735 460Q747 441 766 449Q780 466 764 483Q787 489 783 511Q768 527 749 513Q744 536 723 535Q705 523 711 503Q687 506 681 486Q686 469 704 475Z"/><path d="M579 575Q566 550 585 539Q604 541 608 560Q620 542 639 550Q652 567 637 583Q658 590 654 611Q640 626 621 612Q617 633 597 632Q579 620 585 601Q563 604 557 585Q562 568 579 575Z"/></g><g fill="#ffd46d" stroke="#a86e31" strokeWidth="3"><circle cx="615" cy="496" r="10"/><circle cx="733" cy="486" r="10"/><circle cx="606" cy="587" r="9"/></g><path d="M652 573Q670 550 686 548M623 615Q641 594 657 594" fill="none" stroke="#77a962" strokeWidth="7" strokeLinecap="round"/>{grip}</g>}
    {hand === 'tet-red-envelope' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><rect x="582" y="502" width="151" height="169" rx="17" fill="#c92f3a" stroke="#7e2230" strokeWidth="7"/><path d="M585 520L657 582L730 520" fill="#e34b4d" stroke="#8f2732" strokeWidth="6"/><path d="M586 654L636 600Q657 580 679 601L730 653" fill="#b82634" stroke="#7e2230" strokeWidth="5"/><circle cx="657" cy="580" r="35" fill="#f3c65b" stroke="#a56b29" strokeWidth="6"/><path d="M644 558H669V603H644ZM635 571H679V590H635Z" fill="#9b2932"/><path d="M604 530Q620 514 638 528M680 528Q697 513 713 529" fill="none" stroke="#ffd976" strokeWidth="5" strokeLinecap="round"/><path d="M606 632l7 13 15 2-11 11 3 15-14-8-14 8 3-15-11-11 15-2Z" fill="#ffd46b" opacity=".85"/>{grip}</g>}
    {hand === 'tet-banh-chung' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><rect x="579" y="505" width="158" height="158" rx="20" fill="#4d9a61" stroke="#285f44" strokeWidth="8"/><path d="M589 521Q654 491 727 520L721 648Q654 681 594 648Z" fill="#65b46f" opacity=".7"/><path d="M648 508V660M666 508V660M582 575H734M582 593H734" fill="none" stroke="#f1c75c" strokeWidth="9"/><path d="M596 523Q658 553 720 523M596 646Q658 616 720 646" fill="none" stroke="#8ed28c" strokeWidth="5"/><rect x="627" y="555" width="61" height="58" rx="9" fill="#d13a3f" stroke="#8b2832" strokeWidth="5"/><path d="M643 572H673M643 587H673M643 602H673" stroke="#ffd875" strokeWidth="5" strokeLinecap="round"/>{grip}</g>}
    {hand === 'tet-red-lantern' && <g className={styles.handAccessory} aria-hidden="true" strokeLinejoin="round"><path d="M612 689V470Q612 449 632 449H719" fill="none" stroke="#885333" strokeWidth="12" strokeLinecap="round"/><path d="M682 449V493" stroke="#e0a848" strokeWidth="8"/><path d="M615 499Q682 466 743 500L731 616Q682 650 627 617Z" fill="#d83b42" stroke="#862431" strokeWidth="7"/><path d="M628 497Q682 521 731 499M626 617Q681 594 733 616" fill="none" stroke="#f2bf53" strokeWidth="8"/><path d="M649 492Q632 558 649 622M682 482V631M714 493Q731 558 713 622" fill="none" stroke="#f06b5a" strokeWidth="6"/><path d="M660 547Q682 521 704 547Q682 578 660 547Z" fill="#ffd978" stroke="#a66d2d" strokeWidth="5"/><path d="M682 632V681M665 648L682 667L699 648M666 671L682 690L698 671" fill="none" stroke="#d13a42" strokeWidth="9" strokeLinecap="round"/><circle cx="682" cy="490" r="8" fill="#fff0aa"/>{grip}</g>}
  </>;
}

function SetEffects({ setId }: { setId: string | null }) {
  if (setId === 'cosmic-explorer') return <g className={styles.cosmicEffect} aria-hidden="true">
    <ellipse cx="468" cy="455" rx="284" ry="218" fill="#173a61" opacity=".12"/>
    <ellipse cx="468" cy="455" rx="282" ry="211" fill="none" stroke="#7bd8ff" strokeWidth="5" strokeDasharray="9 17" opacity=".68"/>
    <ellipse cx="468" cy="455" rx="235" ry="174" fill="none" stroke="#c1b6ff" strokeWidth="3" strokeDasharray="4 20" opacity=".52"/>
    <g className={styles.cosmicOrbiter}><circle cx="719" cy="375" r="21" fill="#9cecff" stroke="#4c9ed0" strokeWidth="5"/><path d="M688 374Q719 349 751 375" fill="none" stroke="#fff0aa" strokeWidth="7" strokeLinecap="round"/></g>
    <path d="M250 319l8 16 18 3-13 12 3 18-16-9-16 9 3-18-13-12 18-3Z" fill="#fff0a9"/>
    <path d="M700 614l7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2Z" fill="#d7c6ff"/>
    <path d="M274 625l5 10 12 2-9 8 2 12-10-6-11 6 3-12-9-8 12-2Z" fill="#9cecff" opacity=".9"/>
    <circle cx="229" cy="584" r="9" fill="#9cecff"/><circle cx="694" cy="274" r="8" fill="#fff"/><circle cx="289" cy="258" r="6" fill="#d7c6ff"/><circle cx="752" cy="534" r="7" fill="#fff0a9"/>
  </g>;

  if (setId === 'dino-dreamer') return <g className={styles.dinoDreamEffect} aria-hidden="true">
    <ellipse cx="471" cy="474" rx="275" ry="222" fill="#173f35" opacity=".12"/>
    <path d="M681 235Q720 255 711 298Q701 338 661 342Q687 316 681 279Q677 255 681 235Z" fill="#fff0ae" stroke="#d8b85e" strokeWidth="5" opacity=".9"/>
    <g className={styles.dreamBubble}><circle cx="693" cy="294" r="27" fill="#c9f5df" opacity=".54" stroke="#b6ead3" strokeWidth="5"/><circle cx="738" cy="242" r="16" fill="#dff9ec" opacity=".72"/><circle cx="765" cy="205" r="9" fill="#fff" opacity=".76"/></g>
    <path d="M239 364l8 15 17 3-12 11 3 17-16-9-15 9 3-17-13-11 18-3Z" fill="#e6d4ff" opacity=".94"/>
    <path d="M699 603Q719 579 744 603Q721 629 699 603Z" fill="#ffc4d9" opacity=".82"/>
    <path d="M259 288Q280 268 301 288Q280 310 259 288Z" fill="#baf0d3" opacity=".86"/>
    <circle cx="245" cy="606" r="13" fill="#baf0d3" opacity=".78"/><circle cx="724" cy="544" r="10" fill="#e6d4ff" opacity=".76"/>
    <g fill="#d9c8ff" opacity=".9"><path d="M273 528h34l-34 31h35" fill="none" stroke="#d9c8ff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/><path d="M711 434h26l-26 24h27" fill="none" stroke="#d9c8ff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/></g>
  </g>;

  if (setId === 'snowy-christmas') return <g className={styles.snowEffect} aria-hidden="true">
    <ellipse cx="469" cy="741" rx="245" ry="38" fill="#dff6ff" opacity=".2"/>
    <path d="M212 635Q324 599 431 632Q550 665 735 612" fill="none" stroke="#dff6ff" strokeWidth="8" strokeLinecap="round" opacity=".38"/>
    {[[255, 300, 16], [690, 277, 18], [730, 470, 15], [235, 552, 14], [674, 650, 16], [313, 680, 11], [752, 348, 12], [284, 424, 10]].map(([x, y, size], index) => <g key={index} transform={`translate(${x} ${y}) scale(${size / 15})`} stroke="#dff6ff" strokeWidth="5" strokeLinecap="round" opacity=".96"><path d="M0-15V15M-13-7L13 7M-13 7L13-7"/><circle r="3" fill="#fff" stroke="none"/></g>)}
    <circle cx="316" cy="249" r="7" fill="#fff" opacity=".9"/><circle cx="620" cy="211" r="9" fill="#dff6ff" opacity=".92"/><circle cx="758" cy="575" r="7" fill="#fff" opacity=".88"/><circle cx="214" cy="461" r="6" fill="#dff6ff" opacity=".86"/>
  </g>;

  if (setId === 'shadow-ninja') return <g className={styles.shadowNinjaEffect} aria-hidden="true">
    <ellipse cx="470" cy="482" rx="294" ry="239" fill="#39205f" opacity=".22"/>
    <ellipse cx="470" cy="482" rx="275" ry="218" fill="none" stroke="#a983ff" strokeWidth="4" strokeDasharray="4 18" opacity=".72"/>
    <ellipse cx="470" cy="482" rx="237" ry="186" fill="none" stroke="#5e3e96" strokeWidth="6" strokeDasharray="2 23" opacity=".62"/>
    <path className={styles.ninjaSmoke} d="M182 616Q235 560 298 600T418 577Q478 546 535 588T670 570Q729 548 785 598" fill="none" stroke="#a77bff" strokeWidth="19" strokeLinecap="round" opacity=".20"/>
    <path className={cn(styles.ninjaSmoke, styles.ninjaSmokeAlt)} d="M199 664Q258 622 320 655T450 638Q518 607 590 653T748 639" fill="none" stroke="#3e246c" strokeWidth="26" strokeLinecap="round" opacity=".34"/>
    <g className={styles.ninjaRune} transform="translate(677 254)">
      <circle r="34" fill="#211238" stroke="#c7adff" strokeWidth="4" opacity=".92"/>
      <path d="M0-22V22M-19-11L19 11M-19 11L19-11M-22 0H22" stroke="#d8c5ff" strokeWidth="3" strokeLinecap="round"/>
      <circle r="8" fill="#c498ff"/>
    </g>
    <g className={styles.ninjaShuriken} transform="translate(243 600)">
      <path d="M0-31L10-10 33 0 10 10 0 31-10 10-33 0-10-10Z" fill="#b99dff" stroke="#3c2865" strokeWidth="5"/>
      <circle r="8" fill="#2a1a48" stroke="#e1d5ff" strokeWidth="3"/>
    </g>
    <g fill="#dfceff"><circle cx="245" cy="321" r="7"/><circle cx="298" cy="255" r="5"/><circle cx="740" cy="422" r="8"/><circle cx="714" cy="652" r="5"/></g>
    <g fill="#a879ff"><path d="M710 513l6 12 13 2-10 9 3 14-12-7-13 7 3-14-10-9 13-2Z"/><path d="M302 451l5 10 11 2-8 8 2 11-10-6-10 6 2-11-8-8 11-2Z"/></g>
  </g>;

  if (setId === 'mushroom-kingdom') return <g className={styles.mushroomGroveEffect} aria-hidden="true">
    <ellipse cx="468" cy="693" rx="282" ry="62" fill="#2f1d4d" opacity=".26"/>
    <path d="M192 695Q264 627 342 679T494 671Q569 620 648 681T773 659" fill="none" stroke="#563878" strokeWidth="24" strokeLinecap="round" opacity=".52"/>
    <g className={styles.mushroomBloom} transform="translate(238 565)">
      <path d="M-24 81Q-5 32 19 80L18 122H-23Z" fill="#f4e4bf" stroke="#9f795d" strokeWidth="6"/>
      <path d="M-67 68Q-45 4-3 18Q39 1 67 66Q19 90-67 68Z" fill="#dc5269" stroke="#7f3155" strokeWidth="7"/>
      <circle cx="-29" cy="40" r="10" fill="#fff4d0"/><circle cx="7" cy="29" r="8" fill="#fff4d0"/><circle cx="35" cy="46" r="11" fill="#fff4d0"/>
    </g>
    <g className={cn(styles.mushroomBloom, styles.mushroomBloomAlt)} transform="translate(688 534) scale(.8)">
      <path d="M-24 81Q-5 32 19 80L18 122H-23Z" fill="#f7e8c8" stroke="#9f795d" strokeWidth="7"/>
      <path d="M-67 68Q-45 4-3 18Q39 1 67 66Q19 90-67 68Z" fill="#f0a847" stroke="#9c5d35" strokeWidth="8"/>
      <circle cx="-29" cy="40" r="10" fill="#fff8d8"/><circle cx="7" cy="29" r="8" fill="#fff8d8"/><circle cx="35" cy="46" r="11" fill="#fff8d8"/>
    </g>
    <g className={styles.mushroomSpore} fill="#ffe9a6"><circle cx="262" cy="392" r="8"/><circle cx="306" cy="300" r="5"/><circle cx="694" cy="348" r="8"/><circle cx="745" cy="448" r="5"/><circle cx="644" cy="664" r="6"/></g>
    <g className={styles.mushroomStar} fill="#ffd96c"><path d="M708 255l8 16 18 3-13 12 3 18-16-9-16 9 3-18-13-12 18-3Z"/><path d="M308 514l6 12 13 2-10 9 3 14-12-7-13 7 3-14-10-9 13-2Z"/></g>
    <path d="M257 612Q286 588 316 612M636 609Q666 584 698 605" fill="none" stroke="#9ed37b" strokeWidth="8" strokeLinecap="round" opacity=".85"/>
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
    <SetCharacterFace skin={skin}/>
  </>;
}

function NaturalSetFrontWing({ skin }: { skin: FlytieeSkin }) {
  return <g className={styles.restWing}><path d="M267 432C241 444 228 479 234 521C239 561 259 588 294 606C310 614 322 606 319 592C315 577 298 557 295 536C293 511 308 484 302 460C298 442 284 429 267 432Z" fill={skin.palette.bodyEnd} stroke={skin.palette.outline} strokeWidth="6"/><path d="M262 478C253 511 271 548 289 561" stroke={skin.palette.highlight} strokeWidth="8" strokeLinecap="round"/></g>;
}

function EventSetCharacter({ setId, skin, gradientId }: { setId: string; skin: FlytieeSkin; gradientId: string }) {
  const setSkin = setId === 'shadow-ninja'
    ? SHADOW_NINJA_SKIN
    : setId === 'mushroom-kingdom'
      ? MUSHROOM_KINGDOM_SKIN
      : skin;
  const setGradientId = setId === 'shadow-ninja'
    ? `${gradientId}-shadow-ninja`
    : setId === 'mushroom-kingdom'
      ? `${gradientId}-mushroom-kingdom`
      : gradientId;
  return <g className={styles.fullSetCharacter} strokeLinejoin="round">
    <NaturalSetBase skin={setSkin} gradientId={setGradientId}/>

    {setId === 'cosmic-explorer' && <>
      <path d="M219 495Q461 563 659 495C673 540 675 585 661 627C642 687 602 720 559 733Q463 759 355 731C290 713 240 674 222 616C211 578 210 534 219 495Z" fill="#f5f9fd" stroke="#68829e" strokeWidth="8"/>
      <path d="M226 548Q257 563 303 568L303 647Q273 637 236 611ZM631 558Q650 550 662 540L661 616Q651 644 624 663Z" fill="#b9d9e9" stroke="#7196aa" strokeWidth="5"/>
      <path d="M302 553Q462 590 622 549L630 647Q596 696 552 708Q467 733 375 707Q332 690 298 649Z" fill="#e7f1fa" stroke="#a9bfd1" strokeWidth="5"/>
      <path d="M315 574Q354 594 394 592L386 673Q350 672 316 648ZM539 594Q580 585 612 572L616 647Q585 670 547 676Z" fill="#d1e3f1" stroke="#91aec3" strokeWidth="4"/>
      <path d="M217 499Q462 567 659 498" fill="none" stroke="#6b8da9" strokeWidth="27" strokeLinecap="round"/>
      <path d="M219 496Q461 558 658 496" fill="none" stroke="#e9fbff" strokeWidth="17" strokeLinecap="round"/>
      <path d="M232 512Q463 567 644 511" fill="none" stroke="#78d9ef" strokeWidth="5" strokeLinecap="round"/>
      <path d="M318 543Q466 574 619 540" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".8"/>
      <path d="M311 650Q463 699 624 649" fill="none" stroke="#7899b3" strokeWidth="5"/>
      <path d="M325 668Q465 709 607 666" fill="none" stroke="#fff" strokeWidth="4" opacity=".9"/>
      <rect x="403" y="550" width="126" height="99" rx="17" fill="#708ca7" stroke="#4c6985" strokeWidth="6"/>
      <rect x="412" y="558" width="108" height="80" rx="12" fill="#253b5b" stroke="#b9e4ef" strokeWidth="5"/>
      <rect x="429" y="571" width="74" height="29" rx="7" fill="#6ce4ef"/>
      <path d="M438 587h18l9-10 9 14 8-7h13" fill="none" stroke="#f8ffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="433" cy="621" r="7" fill="#ff8d96"/><circle cx="465" cy="621" r="7" fill="#ffd176"/><circle cx="497" cy="621" r="7" fill="#81e6bb"/>
      <path d="M350 592l9 16 18 3-13 12 3 18-17-8-16 8 3-18-13-12 18-3Z" fill="#f5cf77" stroke="#c19447" strokeWidth="4"/>
      <path d="M556 604h38M556 616h29" stroke="#6088a9" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="578" cy="669" r="12" fill="#65d9e8" stroke="#5285a8" strokeWidth="5"/>
      <path d="M252 580l21 5M628 586l24-11" stroke="#71dbe7" strokeWidth="8" strokeLinecap="round"/>
      <path d="M332 739Q365 727 403 741L401 763H326Z" fill="#597b9e" stroke="#34516f" strokeWidth="6"/>
      <path d="M507 742Q547 727 589 741L593 763H507Z" fill="#597b9e" stroke="#34516f" strokeWidth="6"/>
      <path d="M338 749h54M519 750h61" stroke="#a9e9f1" strokeWidth="5" strokeLinecap="round"/>
      <path d="M309 321Q394 280 494 287Q567 290 622 324" fill="none" stroke="#6385a2" strokeWidth="27" strokeLinecap="round"/>
      <path d="M309 316Q394 277 494 285Q566 290 622 320" fill="none" stroke="#f4faff" strokeWidth="19" strokeLinecap="round"/>
      <path d="M343 303Q461 269 585 306" fill="none" stroke="#9ce6f2" strokeWidth="5" strokeLinecap="round"/>
      <path d="M566 282V247Q566 223 586 218" fill="none" stroke="#597996" strokeWidth="8" strokeLinecap="round"/>
      <circle cx="591" cy="216" r="17" fill="#6fe2ee" stroke="#3f7fa0" strokeWidth="5"/>
      <path d="M589 204l4 9 9 2-7 6 2 9-8-4-8 4 2-9-7-6 9-2Z" fill="#fff3a6"/>
    </>}

    {setId === 'dino-dreamer' && <>
      <path d="M615 578Q701 582 736 643Q695 635 639 683L593 651Z" fill="#6fc5a4" stroke="#398d7c" strokeWidth="8"/>
      <path d="M660 602l22-27 10 34 28-10-15 27 27 19-35 1-11 30-19-25" fill="#ffe7af" stroke="#c6a15e" strokeWidth="5"/>
      <path d="M219 495Q461 563 659 495C673 540 675 585 661 627C642 687 602 720 559 733Q463 759 355 731C290 713 240 674 222 616C211 578 210 534 219 495Z" fill="#81cfad" stroke="#348c78" strokeWidth="8"/>
      <path d="M239 534Q261 557 306 568L303 648Q266 634 229 612ZM627 554Q649 549 661 535L660 610Q650 638 627 655Z" fill="#a8e5c4" stroke="#5aa98a" strokeWidth="5"/>
      <path d="M329 560Q461 588 607 554Q630 588 617 644Q599 704 467 719Q348 715 319 648Q303 597 329 560Z" fill="#e5f7df" stroke="#76b890" strokeWidth="6"/>
      <path d="M349 583Q463 608 586 580" fill="none" stroke="#fff9e8" strokeWidth="6" strokeLinecap="round"/>
      <path d="M340 658Q463 701 597 656" fill="none" stroke="#bbdfb3" strokeWidth="5" strokeLinecap="round"/>
      <path d="M219 496Q461 561 658 496" fill="none" stroke="#3b947c" strokeWidth="28" strokeLinecap="round"/>
      <path d="M219 493Q462 554 658 493" fill="none" stroke="#f0fff0" strokeWidth="18" strokeLinecap="round"/>
      <path d="M234 510Q462 560 640 508" fill="none" stroke="#a7e7bb" strokeWidth="5" strokeLinecap="round"/>
      <path d="M356 544Q462 566 570 541" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".8"/>
      <path d="M289 637Q302 683 349 710M639 631Q623 691 576 713" fill="none" stroke="#4fa485" strokeWidth="5" strokeLinecap="round"/>
      <path d="M419 551Q468 563 512 549L504 602Q467 613 427 603Z" fill="#f3cde0" stroke="#bd83ac" strokeWidth="5"/>
      <path d="M449 569l13 10 23-21" fill="none" stroke="#fff9e9" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M458 612v34" stroke="#79ab89" strokeWidth="5" strokeLinecap="round" strokeDasharray="4 10"/>
      <path d="M398 654Q431 672 463 663Q497 672 532 652" fill="none" stroke="#8fbea0" strokeWidth="5" strokeLinecap="round"/>
      <path d="M352 607Q341 619 349 632Q361 640 374 629M574 608Q586 619 580 632Q568 641 554 629" fill="none" stroke="#80bc95" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="371" cy="566" r="7" fill="#f6cadd"/><circle cx="558" cy="565" r="7" fill="#f6cadd"/>
      <path d="M331 739Q365 727 405 742L402 763H325Z" fill="#c9efd8" stroke="#3d8e75" strokeWidth="6"/>
      <path d="M508 742Q550 727 591 741L595 763H508Z" fill="#c9efd8" stroke="#3d8e75" strokeWidth="6"/>
      <path d="M341 752l-7 9M366 750v11M390 751l7 10M521 752l-7 9M549 750v11M578 751l7 10" stroke="#61ad88" strokeWidth="5" strokeLinecap="round"/>
      <path d="M335 302Q371 264 425 268L463 214L500 269Q558 262 595 304Q528 281 464 282Q394 281 335 302Z" fill="#76cba9" stroke="#348c78" strokeWidth="8"/>
      <path d="M374 276l22-40 24 39 43-62 31 62 36-40 22 47" fill="#d9f5cf" stroke="#5bac89" strokeWidth="6" strokeLinejoin="round"/>
      <path d="M390 275l8-17 10 15M450 259l14-28 14 29M528 272l9-16 8 17" fill="none" stroke="#fff8dd" strokeWidth="5" strokeLinecap="round"/>
      <path d="M336 307Q463 268 597 307" fill="none" stroke="#e4ffe7" strokeWidth="7" strokeLinecap="round"/>
      <path d="M340 307Q465 279 590 308" fill="none" stroke="#3b967d" strokeWidth="4"/>
      <circle cx="365" cy="292" r="7" fill="#f9cfdf"/><circle cx="562" cy="292" r="7" fill="#f9cfdf"/>
    </>}

    {setId === 'snowy-christmas' && <>
      <path d="M220 495Q463 564 658 495C668 526 672 578 661 621C648 680 613 711 566 730Q465 763 354 730C292 711 245 678 225 617C214 576 211 527 220 495Z" fill="#dc4658" stroke="#922f43" strokeWidth="7"/>
      <path d="M223 500Q462 560 655 500" fill="none" stroke="#fffaf0" strokeWidth="19" strokeLinecap="round"/>
      <path d="M231 624Q462 683 657 623L652 669Q463 719 246 667Z" fill="#263040" stroke="#111827" strokeWidth="6"/><rect x="438" y="646" width="57" height="43" rx="8" fill="#f2c65d" stroke="#a9782f" strokeWidth="6"/><rect x="453" y="656" width="27" height="21" rx="4" fill="#263040"/>
      <path d="M330 738Q366 726 405 742L402 762H324Z" fill="#cf3c50" stroke="#7d2638" strokeWidth="6"/><path d="M508 742Q550 727 591 741L595 762H508Z" fill="#cf3c50" stroke="#7d2638" strokeWidth="6"/>
      <path d="M382 514Q462 570 544 511L529 581L466 557L404 587L398 520Z" fill="#2f946f" stroke="#1e654e" strokeWidth="7"/><circle cx="466" cy="550" r="16" fill="#f4ce68" stroke="#a97931" strokeWidth="5"/>
      <g fill="none" stroke="#a97843" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
        <path d="M357 247Q335 207 332 153M340 197L304 168M339 190L353 156"/>
        <path d="M565 247Q591 206 594 153M585 197L620 168M586 190L573 156"/>
      </g>
      <path d="M281 325C305 232 366 161 455 155C540 152 608 232 632 326Q464 293 281 325Z" fill="#dc4658" stroke="#922f43" strokeWidth="8"/>
      <path d="M329 279Q382 199 459 189Q547 188 594 279" fill="none" stroke="#ee8190" strokeWidth="9" strokeLinecap="round" opacity=".75"/>
      <path d="M283 318Q459 282 632 318L631 353Q460 318 284 353Z" fill="#fffaf0" stroke="#d8dce0" strokeWidth="6"/>
      <path d="M308 327Q462 300 606 326" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".9"/>
      <path d="M458 252l7 13 15 2-11 10 3 15-14-7-14 7 3-15-11-10 15-2Z" fill="#f5cb65" stroke="#ac7934" strokeWidth="4"/>
    </>}

    {setId === 'shadow-ninja' && <>
      <g opacity=".96">
        <path d="M301 579L561 384L588 404L329 601Z" fill="#241334" stroke="#10091d" strokeWidth="9"/>
        <path d="M319 581L565 399" stroke="#bfa7ff" strokeWidth="6" strokeLinecap="round"/>
        <path d="M292 592L330 565L355 593L315 620Z" fill="#6f4bb1" stroke="#1b0f2d" strokeWidth="7"/>
        <path d="M580 391L607 370" stroke="#e4d9ff" strokeWidth="7" strokeLinecap="round"/>
      </g>
      <path d="M218 495Q294 530 367 542Q465 557 560 537Q618 526 659 495C677 546 673 607 652 660Q624 718 563 736Q466 763 354 734Q288 715 245 663Q212 608 218 495Z" fill="#211333" stroke="#120a22" strokeWidth="9"/>
      <path d="M234 511Q353 551 464 558Q572 553 643 510L653 578Q576 607 470 610Q359 602 227 573Z" fill="#4c2b78" stroke="#2c184c" strokeWidth="6"/>
      <path d="M247 566Q299 597 342 604L328 678Q281 652 246 618ZM586 603Q627 588 652 564L650 632Q629 673 597 691Z" fill="#382157" stroke="#1b1031" strokeWidth="5"/>
      <path d="M306 575Q391 608 467 609Q543 608 622 576L607 690Q552 726 470 730Q377 725 325 684Z" fill="#321c52" stroke="#512f80" strokeWidth="6"/>
      <path d="M340 617Q382 641 423 647M522 647Q565 637 597 614M350 682Q407 704 465 705Q523 706 582 679" fill="none" stroke="#7351a8" strokeWidth="5" strokeLinecap="round" opacity=".9"/>
      <path d="M221 497Q332 533 465 541Q584 536 657 497" fill="none" stroke="#160b28" strokeWidth="32" strokeLinecap="round"/>
      <path d="M226 492Q338 522 465 531Q583 527 652 492" fill="none" stroke="#6b48a2" strokeWidth="20" strokeLinecap="round"/>
      <path d="M241 492Q352 514 465 520Q574 516 637 493" fill="none" stroke="#d8c5ff" strokeWidth="5" strokeLinecap="round" opacity=".9"/>
      <path d="M332 642Q465 680 608 640L604 680Q464 723 329 681Z" fill="#171027" stroke="#0e091a" strokeWidth="6"/>
      <path d="M337 649Q462 685 602 647" fill="none" stroke="#9c75e7" strokeWidth="5" strokeLinecap="round"/>
      <path d="M429 645H504L521 671L507 696H426L412 671Z" fill="#4a2e76" stroke="#c5a6ff" strokeWidth="5"/>
      <path d="M466 652l9 17 19 3-14 13 4 19-18-10-18 10 4-19-14-13 19-3Z" fill="#e3d3ff" stroke="#7d5ab9" strokeWidth="3"/>
      <path d="M352 738Q367 725 404 740L404 761H323L331 744Z" fill="#29203c" stroke="#120b21" strokeWidth="7"/>
      <path d="M511 740Q549 725 588 740L597 761H509Z" fill="#29203c" stroke="#120b21" strokeWidth="7"/>
      <path d="M335 749H394M521 749H585" stroke="#9677d2" strokeWidth="5" strokeLinecap="round"/>
      <path d="M291 337Q320 231 454 190Q586 225 633 337L603 355Q563 278 462 252Q359 274 322 354Z" fill="#1a102b" stroke="#0e091b" strokeWidth="9"/>
      <path d="M317 334Q356 263 459 236Q556 264 607 335" fill="none" stroke="#5e3c91" strokeWidth="17" strokeLinecap="round"/>
      <path d="M326 340Q459 304 601 339L598 370Q462 339 328 373Z" fill="#392259" stroke="#160d28" strokeWidth="7"/>
      <path d="M340 344Q460 320 586 344" fill="none" stroke="#d2baff" strokeWidth="5" strokeLinecap="round"/>
      <path d="M464 317l8 16 18 3-13 12 3 18-16-9-16 9 3-18-13-12 18-3Z" fill="#e6d8ff" stroke="#7956af" strokeWidth="4"/>
      <circle cx="464" cy="338" r="8" fill="#b885ff"/>
      <path d="M337 497Q463 532 591 499L570 542Q466 568 358 540Z" fill="#160d27" stroke="#2d1948" strokeWidth="6"/>
      <path d="M373 512Q464 543 553 512" fill="none" stroke="#bca1ef" strokeWidth="4" strokeLinecap="round"/>
      <path d="M430 525l8 14 16 2-12 11 3 16-15-8-15 8 3-16-12-11 16-2ZM500 525l8 14 16 2-12 11 3 16-15-8-15 8 3-16-12-11 16-2Z" fill="#8760c4" opacity=".84"/>
      <path d="M294 579Q304 605 323 617M636 577Q622 606 603 621" fill="none" stroke="#cbb6ff" strokeWidth="4" strokeLinecap="round" opacity=".75"/>
    </>}

    {setId === 'mushroom-kingdom' && <>
      <g opacity=".96">
        <path d="M319 565Q282 515 252 499L265 474Q309 484 345 543Z" fill="#3d285c" stroke="#190f2a" strokeWidth="8"/>
        <path d="M613 544Q650 488 691 474L702 499Q665 530 632 574Z" fill="#3d285c" stroke="#190f2a" strokeWidth="8"/>
        <path d="M285 504l20 6M651 509l24-7" stroke="#f3c963" strokeWidth="6" strokeLinecap="round"/>
      </g>
      <path d="M218 495Q304 529 369 541Q463 557 560 537Q617 527 659 495C678 551 673 616 650 667Q619 721 562 738Q465 763 354 736Q291 717 245 665Q211 609 218 495Z" fill="#2a183f" stroke="#160c25" strokeWidth="9"/>
      <path d="M233 511Q342 553 463 560Q575 554 644 511L651 587Q564 620 468 621Q359 614 227 578Z" fill="#623a84" stroke="#3a235c" strokeWidth="7"/>
      <path d="M248 568Q291 590 343 605L328 681Q279 654 245 619ZM585 604Q627 588 652 563L649 633Q629 678 595 696Z" fill="#442861" stroke="#211332" strokeWidth="5"/>
      <path d="M306 577Q383 608 468 612Q546 609 623 576L608 695Q553 728 470 732Q377 727 324 685Z" fill="#382051" stroke="#6a4390" strokeWidth="6"/>
      <path d="M344 617Q387 643 423 650M522 650Q568 637 598 614M348 684Q405 708 467 709Q530 709 586 680" fill="none" stroke="#8760af" strokeWidth="5" strokeLinecap="round" opacity=".9"/>
      <path d="M219 497Q331 534 465 542Q586 537 657 497" fill="none" stroke="#180d29" strokeWidth="33" strokeLinecap="round"/>
      <path d="M225 492Q338 522 465 532Q583 528 652 492" fill="none" stroke="#8953a3" strokeWidth="21" strokeLinecap="round"/>
      <path d="M241 492Q349 514 465 521Q575 517 637 493" fill="none" stroke="#f3d47b" strokeWidth="5" strokeLinecap="round" opacity=".95"/>
      <path d="M333 638Q466 679 608 639L604 681Q465 722 329 681Z" fill="#1b122c" stroke="#10091c" strokeWidth="7"/>
      <path d="M337 647Q463 684 602 646" fill="none" stroke="#e3bb64" strokeWidth="5" strokeLinecap="round"/>
      <path d="M426 644Q464 628 507 646L523 676Q507 700 467 707Q426 700 411 674Z" fill="#5b357a" stroke="#d8b06a" strokeWidth="5"/>
      <path d="M466 649Q440 653 438 676Q466 694 494 676Q493 653 466 649Z" fill="#d95468" stroke="#7d314e" strokeWidth="4"/>
      <path d="M439 674Q465 641 493 674" fill="none" stroke="#fff1c8" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="455" cy="660" r="5" fill="#fff4d6"/><circle cx="475" cy="657" r="5" fill="#fff4d6"/>
      <path d="M351 738Q367 725 404 740L404 761H323L331 744Z" fill="#211630" stroke="#120a20" strokeWidth="7"/>
      <path d="M511 740Q549 725 589 740L597 761H509Z" fill="#211630" stroke="#120a20" strokeWidth="7"/>
      <path d="M334 749H394M521 749H585" stroke="#bc8bce" strokeWidth="5" strokeLinecap="round"/>
      <path d="M286 334Q302 230 395 181Q460 143 529 184Q608 224 635 333Q467 299 286 334Z" fill="#9f3659" stroke="#421b43" strokeWidth="9"/>
      <path d="M310 316Q349 238 421 207Q458 189 503 209Q567 236 608 317" fill="none" stroke="#dc6575" strokeWidth="11" strokeLinecap="round" opacity=".82"/>
      <path d="M289 326Q458 289 632 325L630 361Q461 330 290 363Z" fill="#4b2a68" stroke="#1d1030" strokeWidth="7"/>
      <path d="M305 333Q462 304 615 331" fill="none" stroke="#f5d87b" strokeWidth="5" strokeLinecap="round"/>
      <g fill="#fff3cf" stroke="#bc704f" strokeWidth="4"><circle cx="367" cy="255" r="18"/><circle cx="443" cy="208" r="15"/><circle cx="524" cy="246" r="20"/><circle cx="573" cy="288" r="12"/></g>
      <path d="M334 491Q462 530 592 498L572 544Q466 570 357 541Z" fill="#241333" stroke="#412154" strokeWidth="6"/>
      <path d="M375 513Q463 543 554 512" fill="none" stroke="#efca72" strokeWidth="4" strokeLinecap="round"/>
      <g fill="#ffdd76" stroke="#a46a43" strokeWidth="3"><path d="M397 526l6 12 14 2-10 9 2 14-12-7-13 7 3-14-10-9 14-2Z"/><path d="M533 526l6 12 14 2-10 9 2 14-12-7-13 7 3-14-10-9 14-2Z"/></g>
      <path d="M293 580Q308 604 324 618M636 578Q622 607 603 621" fill="none" stroke="#f3d47b" strokeWidth="4" strokeLinecap="round" opacity=".78"/>
      <path d="M347 581Q374 564 398 581M535 580Q559 564 584 578" fill="none" stroke="#b16fbb" strokeWidth="5" strokeLinecap="round"/>
    </>}
    <NaturalSetFrontWing skin={setSkin}/>
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
  const wearingConicalHat = !setId && profile.equipped.head === 'vietnam-conical-hat';
  return <g className={cn(styles.scene, className)} data-mood={mood} data-held={!setId && Boolean(profile.equipped.hand) ? 'true' : 'false'} data-skin={skin.id} data-set={setId ?? 'none'}>
    <SetEffects setId={setId}/>
    <ellipse cx="454" cy="760" rx="170" ry="18" fill="#7b84ae" opacity=".17"/>
    {setId ? <g className={styles.body}><EventSetCharacter setId={setId} skin={skin} gradientId={gradientId}/></g> : <g className={styles.body}>
      <g fill="#f4b66b" stroke="#d48a45" strokeWidth="5" strokeLinejoin="round"><path d="M365 696C351 711 350 731 338 739C327 747 329 757 342 758H390C408 757 405 744 391 739L390 701Z"/><path d="M510 702L514 739C500 748 505 758 519 758H564C580 757 579 748 565 740L546 696Z"/></g>
      <g className={styles.waveWing}><path d="M593 493C637 468 661 429 683 387C694 366 709 376 707 394L702 421C724 399 739 410 728 431L717 451C740 438 751 452 732 471C756 465 760 480 741 496C710 526 663 551 613 547Z" fill={skin.palette.bodyMid} stroke={skin.palette.outline} strokeWidth="6" strokeLinejoin="round"/></g>
      <path d={wearingConicalHat
        ? 'M366 267C393 245 425 234 459 234C494 234 523 246 546 270C622 309 671 406 666 532C663 663 595 730 467 735C340 741 240 695 226 576C209 433 251 303 366 267Z'
        : 'M366 267C342 239 338 217 350 203C363 189 389 210 413 237C407 201 416 175 433 173C452 171 461 206 463 236C480 213 500 205 511 218C520 230 507 253 491 267C609 285 671 396 666 532C663 663 595 730 467 735C340 741 240 695 226 576C209 433 251 303 366 267Z'} fill={`url(#${gradientId}-body)`} stroke={skin.palette.outline} strokeWidth="7"/>
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
    <defs>
      <linearGradient id={`${gradientId}-body`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={skin.palette.bodyStart}/><stop offset=".5" stopColor={skin.palette.bodyMid}/><stop offset="1" stopColor={skin.palette.bodyEnd}/></linearGradient>
      <linearGradient id={`${gradientId}-belly`} x2="0" y2="1"><stop stopColor={skin.palette.bellyStart}/><stop offset="1" stopColor={skin.palette.bellyEnd}/></linearGradient>
      <linearGradient id={`${gradientId}-shadow-ninja-body`} x1=".12" y1="0" x2=".86" y2="1"><stop stopColor="#b69aff"/><stop offset=".48" stopColor="#604096"/><stop offset="1" stopColor="#181026"/></linearGradient>
      <linearGradient id={`${gradientId}-mushroom-kingdom-body`} x1=".1" y1="0" x2=".9" y2="1"><stop stopColor="#c0a6ff"/><stop offset=".46" stopColor="#674790"/><stop offset="1" stopColor="#1b122d"/></linearGradient>
    </defs>
    {previousMood && <BirdScene key={`${previousMood}-out`} mood={previousMood} profile={profile} gradientId={gradientId} className={cn(styles.sceneExit, longTransition && styles.sceneTransitionLong)}/>}
    <BirdScene key={`${visibleMood}-in`} mood={visibleMood} profile={profile} gradientId={gradientId} className={cn(previousMood && styles.sceneEnter, longTransition && styles.sceneTransitionLong)}/>
  </svg>;
}
