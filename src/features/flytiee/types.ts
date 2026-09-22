export type FlytieeMood =
  | 'idle'
  | 'look'
  | 'sway'
  | 'feet'
  | 'fly'
  | 'sneeze'
  | 'scratch'
  | 'hungry'
  | 'eat'
  | 'happy'
  | 'sleep';

export type FlytieeAccessorySlot = 'head' | 'eyes' | 'neck' | 'hand';

export type FlytieeSkinMood = 'friendly' | 'gentle' | 'bright' | 'curious' | 'stern' | 'dreamy';

export interface FlytieeSkin {
  id: string;
  name: string;
  price: number;
  description: string;
  personality: string;
  mood: FlytieeSkinMood;
  palette: {
    bodyStart: string;
    bodyMid: string;
    bodyEnd: string;
    outline: string;
    highlight: string;
    bellyStart: string;
    bellyEnd: string;
    cheek: string;
    eye: string;
    brow: string;
    accent: string;
  };
}

export type FlytieeSetEffect =
  | 'cosmic-orbit'
  | 'dino-dream'
  | 'gentle-snow'
  | 'shadow-eclipse'
  | 'mushroom-grove';

export type FlytieeChestTier = 'bronze' | 'silver' | 'gold';

export interface FlytieeDailyEventState {
  date: string;
  streakClaimed: boolean;
  studyClaimedMilestones: number[];
  practiceCoinsClaimed: number;
  completionChestClaimed: boolean;
}

export interface FlytieeEventStats {
  streak: number;
  studyMinutes: number;
  correctByLevel: Record<1 | 2 | 3 | 4, number>;
  practiceCoinsEarned: number;
}

export type FlytieeRewardKind = 'coins' | 'chest' | 'accessory' | 'skin' | 'set';

export interface FlytieeRewardResult {
  kind: FlytieeRewardKind;
  title: string;
  description: string;
  amount?: number;
  chestTier?: FlytieeChestTier;
  itemId?: string;
}

export interface FlytieeSet {
  id: string;
  name: string;
  description: string;
  eventName: string;
  effect: FlytieeSetEffect;
  tone: string;
}

export interface FlytieeProfile {
  version: 1;
  name: string;
  level: number;
  xp: number;
  coins: number;
  satiety: number;
  satietyUpdatedAt: string;
  ownedAccessoryIds: string[];
  equipped: Partial<Record<FlytieeAccessorySlot, string>>;
  ownedSkinIds: string[];
  equippedSkinId: string;
  ownedSetIds: string[];
  equippedSetId: string | null;
  claimedMissionIds: string[];
  chests: Record<FlytieeChestTier, number>;
  dailyEvent: FlytieeDailyEventState;
  redeemedMailCodes: string[];
}

export interface FlytieeMission {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  xp: number;
  coins: number;
}

export interface FlytieeAccessory {
  id: string;
  name: string;
  slot: FlytieeAccessorySlot;
  price: number;
  description: string;
  tone: string;
}
