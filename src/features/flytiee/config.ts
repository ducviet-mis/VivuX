import type { FlytieeAccessory, FlytieeAccessorySlot, FlytieeProfile } from './types';

export const FLYTIEE_METADATA_KEY = 'flytiee';
export const FLYTIEE_STORAGE_PREFIX = 'flydo:flytiee:v1';

export const DEFAULT_FLYTIEE_PROFILE: FlytieeProfile = {
  version: 1,
  name: 'FlyTiee',
  level: 1,
  xp: 0,
  coins: 60,
  satiety: 78,
  satietyUpdatedAt: new Date().toISOString(),
  ownedAccessoryIds: [],
  equipped: {},
  claimedMissionIds: [],
};

export const ACCESSORY_SLOT_LABELS: Record<FlytieeAccessorySlot, string> = {
  head: 'Mũ & băng đô',
  eyes: 'Kính',
  neck: 'Cổ & ngực',
  hand: 'Vật cầm tay',
};

export const FLYTIEE_ACCESSORIES: FlytieeAccessory[] = [
  { id: 'cat-bow-headband', name: 'Băng đô mèo nơ hồng', slot: 'head', price: 55, description: 'Tai mèo trắng cùng chiếc nơ hồng thật ngọt ngào.', tone: 'coral' },
  { id: 'sweet-heart-glasses', name: 'Kính trái tim kẹo ngọt', slot: 'eyes', price: 45, description: 'Cặp kính hồng dành cho những ngày thật đáng yêu.', tone: 'coral' },
  { id: 'pink-kawaii-bow', name: 'Nơ hồng đáng yêu', slot: 'neck', price: 40, description: 'Một chiếc nơ mềm xinh xắn trước ngực FlyTiee.', tone: 'coral' },
  { id: 'cat-mini-bag', name: 'Túi mèo mini', slot: 'hand', price: 50, description: 'Chiếc túi mặt mèo nhỏ gọn cho buổi đến lớp.', tone: 'coral' },
  { id: 'heart-magic-wand', name: 'Đũa phép trái tim', slot: 'hand', price: 55, description: 'Mang theo một chút phép màu màu hồng.', tone: 'coral' },
  { id: 'santa-hat', name: 'Mũ Noel ấm áp', slot: 'head', price: 55, description: 'Chiếc mũ đỏ mềm mại cho đêm Giáng sinh.', tone: 'red' },
  { id: 'snowflake-glasses', name: 'Kính bông tuyết', slot: 'eyes', price: 45, description: 'Khung kính xanh lấp lánh như tuyết đầu mùa.', tone: 'cyan' },
  { id: 'jingle-bell', name: 'Nơ chuông leng keng', slot: 'neck', price: 45, description: 'Chiếc chuông vàng ngân vang lời chúc an lành.', tone: 'yellow' },
  { id: 'candy-cane', name: 'Gậy kẹo Giáng sinh', slot: 'hand', price: 40, description: 'Ngọt ngào, nổi bật với hai màu đỏ trắng.', tone: 'red' },
  { id: 'christmas-gift', name: 'Hộp quà bí mật', slot: 'hand', price: 50, description: 'Một món quà nhỏ đang chờ được mở.', tone: 'green' },
  { id: 'moon-rabbit', name: 'Băng đô thỏ ngọc', slot: 'head', price: 50, description: 'Đôi tai mềm cùng đi chơi đêm trăng.', tone: 'coral' },
  { id: 'moon-glasses', name: 'Kính trăng sao', slot: 'eyes', price: 45, description: 'Ngắm trăng qua chiếc kính vàng xinh.', tone: 'yellow' },
  { id: 'moon-pendant', name: 'Vòng cổ trăng rằm', slot: 'neck', price: 40, description: 'Vầng trăng nhỏ ôm lấy ngôi sao.', tone: 'yellow' },
  { id: 'star-lantern', name: 'Đèn ông sao', slot: 'hand', price: 55, description: 'Rước đèn cùng FlyTiee đêm Trung thu.', tone: 'red' },
  { id: 'moon-cake', name: 'Bánh Trung thu', slot: 'hand', price: 35, description: 'Chiếc bánh vàng cho mùa đoàn viên.', tone: 'yellow' },
  { id: 'focus-band', name: 'Băng đô quyết tâm', slot: 'head', price: 25, description: 'Đeo vào là sẵn sàng chinh phục bài khó.', tone: 'coral' },
  { id: 'graduation-cap', name: 'Mũ tốt nghiệp', slot: 'head', price: 65, description: 'Một lời nhắc nhỏ về đích đến lớn.', tone: 'navy' },
  { id: 'round-glasses', name: 'Kính mọt sách', slot: 'eyes', price: 35, description: 'Nhìn công thức nào cũng thật rõ ràng.', tone: 'indigo' },
  { id: 'lab-goggles', name: 'Kính nhà khoa học', slot: 'eyes', price: 45, description: 'Dành cho những buổi học đầy khám phá.', tone: 'cyan' },
  { id: 'red-scarf', name: 'Khăn quàng đỏ', slot: 'neck', price: 30, description: 'Một phụ kiện học đường thật thân quen.', tone: 'red' },
  { id: 'class-bow', name: 'Nơ lớp trưởng', slot: 'neck', price: 30, description: 'Gọn gàng, tự tin và đầy trách nhiệm.', tone: 'mint' },
  { id: 'study-pencil', name: 'Bút chì chăm học', slot: 'hand', price: 40, description: 'Ghi lại từng bước giải hay.', tone: 'yellow' },
  { id: 'idea-book', name: 'Sổ tay ý tưởng', slot: 'hand', price: 45, description: 'Cất giữ những cách giải thông minh.', tone: 'green' },
];

export function xpNeededForLevel(level: number) {
  return 80 + Math.max(1, level) * 20;
}

export function normalizeFlytieeProfile(value: unknown): FlytieeProfile {
  const raw = value && typeof value === 'object' ? value as Partial<FlytieeProfile> : {};
  const updatedAt = typeof raw.satietyUpdatedAt === 'string' && Number.isFinite(Date.parse(raw.satietyUpdatedAt))
    ? raw.satietyUpdatedAt
    : new Date().toISOString();

  return {
    version: 1,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 20) : DEFAULT_FLYTIEE_PROFILE.name,
    level: Number.isInteger(raw.level) && Number(raw.level) > 0 ? Number(raw.level) : 1,
    xp: Number.isFinite(raw.xp) && Number(raw.xp) >= 0 ? Math.floor(Number(raw.xp)) : 0,
    coins: Number.isFinite(raw.coins) && Number(raw.coins) >= 0 ? Math.floor(Number(raw.coins)) : DEFAULT_FLYTIEE_PROFILE.coins,
    satiety: Number.isFinite(raw.satiety) ? Math.min(100, Math.max(0, Number(raw.satiety))) : DEFAULT_FLYTIEE_PROFILE.satiety,
    satietyUpdatedAt: updatedAt,
    ownedAccessoryIds: Array.isArray(raw.ownedAccessoryIds) ? raw.ownedAccessoryIds.filter((id): id is string => typeof id === 'string') : [],
    equipped: raw.equipped && typeof raw.equipped === 'object' ? raw.equipped : {},
    claimedMissionIds: Array.isArray(raw.claimedMissionIds) ? raw.claimedMissionIds.filter((id): id is string => typeof id === 'string').slice(-120) : [],
  };
}
