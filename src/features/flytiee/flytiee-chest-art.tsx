'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';
import type { FlytieeChestTier } from './types';
import styles from './flytiee-events.module.css';

const METAL: Record<FlytieeChestTier, { edge: string; shine: string; dark: string }> = {
  bronze: { edge: '#cf8754', shine: '#f1bc80', dark: '#704632' },
  silver: { edge: '#b8c9df', shine: '#f1f7ff', dark: '#536785' },
  gold: { edge: '#f5c65f', shine: '#fff1bb', dark: '#965d26' },
};

export function ChestArt({ tier, opening = false, className }: {
  tier: FlytieeChestTier;
  opening?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const metal = METAL[tier];
  const lid = tier === 'silver'
    ? 'M24 82 33 44Q38 33 54 30L72 21H128L146 30Q162 33 167 44L176 82Z'
    : tier === 'gold'
      ? 'M20 84Q24 33 69 22Q100 10 131 22Q176 33 180 84Z'
      : 'M26 82Q27 45 57 34Q77 26 100 27Q123 26 143 34Q173 45 174 82Z';

  return <svg
    viewBox="0 0 200 170"
    className={cn(styles.chestArt, opening && styles.chestOpening, className)}
    data-tier={tier}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={`${id}-lid`} x1="0" x2="1" y1="0" y2="1">
        <stop stopColor={tier === 'bronze' ? '#d18a59' : tier === 'silver' ? '#d6e4f3' : '#ffe09a'} />
        <stop offset=".52" stopColor={tier === 'bronze' ? '#955c3e' : tier === 'silver' ? '#849ab8' : '#e9aa35'} />
        <stop offset="1" stopColor={metal.dark} />
      </linearGradient>
      <linearGradient id={`${id}-body`} x1=".08" x2=".9" y1="0" y2="1">
        <stop stopColor={tier === 'bronze' ? '#b9764a' : tier === 'silver' ? '#a8bad2' : '#f6c563'} />
        <stop offset=".55" stopColor={tier === 'bronze' ? '#825038' : tier === 'silver' ? '#6e829f' : '#c78125'} />
        <stop offset="1" stopColor={tier === 'bronze' ? '#56392f' : tier === 'silver' ? '#425572' : '#865028'} />
      </linearGradient>
      <linearGradient id={`${id}-light`} x1="0" x2="0" y1="1" y2="0">
        <stop stopColor={tier === 'bronze' ? '#f5b97b' : tier === 'silver' ? '#b9e9ff' : '#fff2a8'} stopOpacity=".85" />
        <stop offset="1" stopColor={tier === 'bronze' ? '#f5b97b' : tier === 'silver' ? '#b9e9ff' : '#fff2a8'} stopOpacity="0" />
      </linearGradient>
    </defs>

    <ellipse cx="100" cy="155" rx="73" ry="9" fill="#101428" opacity=".3" />
    <g className={styles.chestLight}>
      <path d="M66 85 18 5Q100 24 182 5L134 85Z" fill={`url(#${id}-light)`} />
      <path d="M100 19v-12M63 29 54 18M137 29l9-11" stroke={metal.shine} strokeWidth="3" strokeLinecap="round" />
    </g>

    <path d="M29 74H171V124L158 137H42L29 124Z" fill={metal.dark} stroke={metal.edge} strokeWidth="4" />
    <path d="M36 77H164V124L155 132H45L36 124Z" fill="#171c30" />

    <g className={styles.chestLid}>
      <path d={lid} fill={`url(#${id}-lid)`} stroke={metal.dark} strokeWidth="5" strokeLinejoin="round" />
      {tier === 'bronze' && <>
        <path d="M34 69Q38 43 69 36Q100 26 131 36Q162 43 166 69" fill="none" stroke="#f1b57b" strokeWidth="5" opacity=".8" />
        <path d="M38 53Q100 70 162 53M44 65Q100 78 156 65" fill="none" stroke="#633d31" strokeWidth="3" opacity=".65" />
        <path d="M56 39Q47 55 45 74M144 39Q153 55 155 74" fill="none" stroke={metal.edge} strokeWidth="9" />
        <circle cx="49" cy="66" r="3" fill={metal.shine} /><circle cx="151" cy="66" r="3" fill={metal.shine} />
      </>}
      {tier === 'silver' && <>
        <path d="M35 73 45 44 75 31H125L155 44 165 73" fill="none" stroke="#edf5ff" strokeWidth="5" opacity=".85" />
        <path d="M54 40 72 70M146 40 128 70M77 30 84 69M123 30 116 69" fill="none" stroke="#5a7195" strokeWidth="4" />
        <path d="M100 29 111 47 100 63 89 47Z" fill="#d9f8ff" stroke="#647da5" strokeWidth="3" />
        <path d="M100 34 104 47 100 54 96 47Z" fill="#fff" />
      </>}
      {tier === 'gold' && <>
        <path d="M30 73Q34 39 72 29Q100 20 128 29Q166 39 170 73" fill="none" stroke="#fff1bc" strokeWidth="6" />
        <path d="M43 61Q100 37 157 61M50 70Q100 49 150 70" fill="none" stroke="#9b5d26" strokeWidth="3" opacity=".8" />
        <path d="M75 27 84 48 100 32 116 48 125 27" fill="none" stroke="#a3652a" strokeWidth="7" strokeLinejoin="round" />
        <path d="M75 27 84 48 100 32 116 48 125 27" fill="none" stroke="#ffe6a0" strokeWidth="3" strokeLinejoin="round" />
        <path d="M100 36 108 51 100 63 92 51Z" fill="#e98067" stroke="#fff0b1" strokeWidth="3" />
        <circle cx="47" cy="68" r="3" fill="#fff5cb" /><circle cx="153" cy="68" r="3" fill="#fff5cb" />
      </>}
      <path d="M24 77H176V88H24Z" fill={metal.dark} stroke={metal.edge} strokeWidth="3" />
      <path d="M28 80H172" stroke={metal.shine} strokeWidth="3" strokeLinecap="round" />
    </g>

    <g className={styles.chestBody}>
      <path d="M24 87H176L171 139Q167 146 158 146H42Q33 146 29 139Z" fill={`url(#${id}-body)`} stroke={metal.dark} strokeWidth="5" strokeLinejoin="round" />
      <path d="M36 97H164L159 133H41Z" fill="none" stroke={metal.edge} strokeWidth="2" opacity=".7" />
      <path d="M34 107H166M39 135H161" stroke={metal.dark} strokeWidth="3" opacity=".55" />
      <path d="M43 89 48 143M157 89 152 143" stroke={metal.edge} strokeWidth={tier === 'gold' ? '11' : '9'} />
      <path d="M45 91 50 139M155 91 150 139" stroke={metal.shine} strokeWidth="2" opacity=".85" />
      {tier === 'bronze' && <>
        <path d="M61 104Q72 97 82 104M118 104Q128 97 139 104M62 125Q73 119 83 124M117 124Q128 119 139 125" fill="none" stroke="#5f3b30" strokeWidth="2" opacity=".58" />
        <circle cx="36" cy="98" r="2.5" fill="#f1c18a" /><circle cx="164" cy="98" r="2.5" fill="#f1c18a" />
        <circle cx="39" cy="136" r="2.5" fill="#f1c18a" /><circle cx="161" cy="136" r="2.5" fill="#f1c18a" />
      </>}
      {tier === 'silver' && <>
        <path d="M63 100 76 111 63 122M137 100 124 111 137 122" fill="none" stroke="#d9f2ff" strokeWidth="3" strokeLinejoin="round" />
        <path d="M55 94 65 107 55 121M145 94 135 107 145 121" fill="none" stroke="#536987" strokeWidth="2" />
        <circle cx="38" cy="97" r="2.5" fill="#f3fbff" /><circle cx="162" cy="97" r="2.5" fill="#f3fbff" />
      </>}
      {tier === 'gold' && <>
        <path d="M62 102Q77 108 84 121M138 102Q123 108 116 121M61 127Q73 119 82 127M139 127Q127 119 118 127" fill="none" stroke="#ffdc83" strokeWidth="3" strokeLinecap="round" />
        <path d="M34 97 43 104 35 111M166 97 157 104 165 111" fill="none" stroke="#ffe7a5" strokeWidth="3" />
        <circle cx="39" cy="130" r="3" fill="#fff4bd" /><circle cx="161" cy="130" r="3" fill="#fff4bd" />
      </>}
      <path d="M84 85H116V114Q116 123 100 130Q84 123 84 114Z" fill={metal.dark} stroke={metal.shine} strokeWidth="4" strokeLinejoin="round" />
      <path d="M91 93H109V113Q109 117 100 121Q91 117 91 113Z" fill={metal.edge} />
      {tier === 'bronze' ? <path d="M100 97 106 103 104 112H96L94 103Z" fill="#ffe0a8" />
        : tier === 'silver' ? <path d="M100 96 107 105 100 116 93 105Z" fill="#d7f8ff" stroke="#fff" strokeWidth="2" />
          : <path d="M100 95 108 104 104 115H96L92 104Z" fill="#fff3ba" stroke="#b87332" strokeWidth="2" />}
      <path d="M32 144Q100 153 168 144" fill="none" stroke={metal.shine} strokeWidth="3" opacity=".78" />
    </g>

    <g className={styles.chestSparks} fill={metal.shine}>
      <path d="m33 37 3 7 7 3-7 3-3 7-3-7-7-3 7-3ZM164 31l3 6 6 3-6 3-3 6-3-6-6-3 6-3Z" />
      <circle cx="56" cy="17" r="3" /><circle cx="143" cy="13" r="2.5" />
    </g>
  </svg>;
}
