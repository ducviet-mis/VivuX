import { FlytieeCoin } from './flytiee-coin';
import styles from './flytiee-coin-reward.module.css';

export function FlytieeCoinReward({ amount, compact = false }: { amount: number; compact?: boolean }) {
  return (
    <div className={compact ? styles.compact : styles.scene} aria-label={`Nhận ${amount} xu FlyTiee`}>
      <span className={styles.halo} aria-hidden="true" />
      <span className={styles.coin}><FlytieeCoin /></span>
      <span className={styles.satelliteOne} aria-hidden="true"><FlytieeCoin /></span>
      <span className={styles.satelliteTwo} aria-hidden="true"><FlytieeCoin /></span>
      <span className={styles.amount}>+{amount.toLocaleString('vi-VN')} <span>xu</span></span>
    </div>
  );
}
