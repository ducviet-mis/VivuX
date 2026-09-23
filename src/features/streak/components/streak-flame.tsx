import styles from './streak-card.module.css';

export function StreakFlame({ days, small = false }: { days: number; small?: boolean }) {
  const tier = days >= 200 ? 7 : days >= 150 ? 6 : days >= 100 ? 5 : days >= 80 ? 4 : days >= 50 ? 3 : days >= 30 ? 2 : days >= 10 ? 1 : 0;
  return (
    <span className={small ? styles.flameSmall : styles.flameFrame} data-tier={tier} aria-hidden="true">
      <svg viewBox="0 0 90 108" className={styles.flameArt} fill="none">
        <path className={styles.flameOuter} d="M45 6c3 18-10 25-16 35-4-10-3-17-3-17C15 37 9 52 9 69c0 21 16 35 36 35s36-14 36-35c0-21-15-39-23-48 0 16-7 21-7 21C50 27 43 19 45 6Z" />
        <path className={styles.flameMiddle} d="M45 38c1 13-9 20-15 27-2-7-1-11-1-11-7 8-10 17-10 25 0 14 11 24 26 24s26-10 26-24c0-12-8-24-15-31-1 11-6 14-6 14-1-9-4-17-5-24Z" />
        <path className={styles.flameCore} d="M44 68c-1 9-10 13-10 23 0 7 5 12 12 12 8 0 13-5 13-12 0-8-8-17-10-20 0 7-5 10-5 10V68Z" />
        <path d="M23 61c2-9 6-16 11-21" stroke="white" strokeOpacity=".57" strokeWidth="3" strokeLinecap="round" />
        {tier >= 4 && <path d="m70 7 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="currentColor" />}
      </svg>
    </span>
  );
}
