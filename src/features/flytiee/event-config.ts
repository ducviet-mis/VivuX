import type { FlytieeChestTier, FlytieeRewardResult } from './types';

export const STUDY_MILESTONES = [
  { minutes: 15, label: 'Khởi động', reward: { kind: 'coins', amount: 20 } as const },
  { minutes: 45, label: 'Tập trung', reward: { kind: 'coins', amount: 50 } as const },
  { minutes: 90, label: 'Bền bỉ', reward: { kind: 'chest', chestTier: 'silver' } as const },
];

export const STREAK_REWARDS = [
  { day: 1, kind: 'coins', amount: 15, label: '15 xu' },
  { day: 2, kind: 'coins', amount: 20, label: '20 xu' },
  { day: 3, kind: 'chest', chestTier: 'silver', label: 'Rương bạc' },
  { day: 4, kind: 'coins', amount: 30, label: '30 xu' },
  { day: 5, kind: 'coins', amount: 40, label: '40 xu' },
  { day: 6, kind: 'coins', amount: 50, label: '50 xu' },
  { day: 7, kind: 'chest', chestTier: 'gold', label: 'Rương vàng' },
] as const;

export const CHEST_LABELS: Record<FlytieeChestTier, string> = {
  bronze: 'Rương đồng',
  silver: 'Rương bạc',
  gold: 'Rương vàng',
};

export const CHEST_COIN_POOLS: Record<FlytieeChestTier, number[]> = {
  bronze: [5, 10, 15, 20, 30],
  silver: [10, 15, 25, 30, 50],
  gold: [30, 50, 70, 100],
};

export type BirdieMailReward =
  | { kind: 'coins'; amount: number }
  | { kind: 'chest'; chestTier: FlytieeChestTier }
  | { kind: 'accessory'; itemId: string }
  | { kind: 'skin'; itemId: string }
  | { kind: 'set'; itemId: string };

/**
 * Starter Birdie Mail codes. Move these to a server-side gift-code table when
 * FlyDo adds an Admin campaign manager; redemption is still one-time per account.
 */
export const BIRDIE_MAIL_CODES: Record<string, BirdieMailReward> = {
  'BIRDIE-WELCOME': { kind: 'coins', amount: 50 },
  'CHAM-HOC': { kind: 'accessory', itemId: 'study-pencil' },
  'BAY-CAO': { kind: 'chest', chestTier: 'silver' },
};

export function rewardForStreakDay(day: number): FlytieeRewardResult {
  const reward = STREAK_REWARDS[Math.max(0, Math.min(6, day - 1))];
  if (reward.kind === 'coins') {
    return {
      kind: 'coins',
      title: `Điểm danh ngày ${day}`,
      description: `Chuỗi học tập được tiếp nối. Bạn nhận ${reward.amount} xu!`,
      amount: reward.amount,
    };
  }
  return {
    kind: 'chest',
    title: `Điểm danh ngày ${day}`,
    description: `${CHEST_LABELS[reward.chestTier]} đã được chuyển vào kho rương.`,
    chestTier: reward.chestTier,
  };
}
