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
  claimedMissionIds: string[];
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
