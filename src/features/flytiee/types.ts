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
