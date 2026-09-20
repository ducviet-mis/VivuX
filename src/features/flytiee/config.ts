import type { FlytieeAccessory, FlytieeAccessorySlot, FlytieeDailyEventState, FlytieeProfile, FlytieeSet, FlytieeSkin } from './types';

function currentDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

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
  ownedSkinIds: ['classic'],
  equippedSkinId: 'classic',
  ownedSetIds: [],
  equippedSetId: null,
  claimedMissionIds: [],
  chests: { bronze: 0, silver: 0, gold: 0 },
  dailyEvent: {
    date: currentDateKey(),
    streakClaimed: false,
    studyClaimedMilestones: [],
    practiceCoinsClaimed: 0,
    completionChestClaimed: false,
  },
  redeemedMailCodes: [],
};

export const FLYTIEE_SETS: FlytieeSet[] = [
  {
    id: 'cosmic-explorer',
    name: 'Nhà thám hiểm vũ trụ',
    description: 'Bộ phi hành gia trắng xanh, mũ kính trong và quỹ đạo sao tí hon.',
    eventName: 'Sự kiện Chạm tới vì sao',
    effect: 'cosmic-orbit',
    tone: 'cyan',
  },
  {
    id: 'dino-dreamer',
    name: 'Khủng long ngủ ngoan',
    description: 'Bộ đồ ngủ khủng long xanh bạc hà, mềm xốp với đuôi và móng chân tí hon.',
    eventName: 'Sự kiện Đêm ngủ diệu kỳ',
    effect: 'dino-dream',
    tone: 'mint',
  },
  {
    id: 'snowy-christmas',
    name: 'Giáng sinh tuyết',
    description: 'Áo choàng đỏ phủ viền lông ấm áp, bốt tuyết và những bông tuyết dịu nhẹ.',
    eventName: 'Sự kiện Mùa đông nhiệm màu',
    effect: 'gentle-snow',
    tone: 'red',
  },
];

export function getFlytieeSet(id?: string | null) {
  return FLYTIEE_SETS.find((set) => set.id === id) ?? null;
}

export const FLYTIEE_SKINS: FlytieeSkin[] = [
  {
    id: 'classic', name: 'Xanh trời nguyên bản', price: 0,
    description: 'Màu xanh thân quen, trong trẻo và luôn sẵn sàng học cùng bạn.',
    personality: 'Thân thiện', mood: 'friendly',
    palette: { bodyStart: '#a8b6ff', bodyMid: '#8394f5', bodyEnd: '#6574d9', outline: '#586ac4', highlight: '#d0d9ff', bellyStart: '#fff9e8', bellyEnd: '#f4e8c9', cheek: '#e6a5bd', eye: '#26345e', brow: '#58679d', accent: '#7f91ff' },
  },
  {
    id: 'sakura', name: 'Hồng đào Sakura', price: 130,
    description: 'Sắc hoa anh đào dịu dàng với ánh nhìn mềm mại, ấm áp.',
    personality: 'Dịu dàng', mood: 'gentle',
    palette: { bodyStart: '#ffd2df', bodyMid: '#f3a9c2', bodyEnd: '#d979a2', outline: '#bd608c', highlight: '#fff0f5', bellyStart: '#fffaf4', bellyEnd: '#f8dfd7', cheek: '#f487ad', eye: '#67405f', brow: '#9b5479', accent: '#f59abb' },
  },
  {
    id: 'golden-canary', name: 'Hoàng yến Hoàng Kim', price: 155,
    description: 'Rực rỡ như nắng sớm, đôi mắt luôn lấp lánh đầy hào hứng.',
    personality: 'Rạng rỡ', mood: 'bright',
    palette: { bodyStart: '#ffe99a', bodyMid: '#f7c94d', bodyEnd: '#df9f25', outline: '#bd7d19', highlight: '#fff7c9', bellyStart: '#fffdf0', bellyEnd: '#f7e7b3', cheek: '#f39b72', eye: '#553c27', brow: '#8b5d22', accent: '#ffd45d' },
  },
  {
    id: 'pastel-jade', name: 'Xanh ngọc Pastel', price: 120,
    description: 'Trong veo như làn nước mát, tò mò và thích khám phá điều mới.',
    personality: 'Tò mò', mood: 'curious',
    palette: { bodyStart: '#c7f3e9', bodyMid: '#80d7c7', bodyEnd: '#4fb6aa', outline: '#3a918b', highlight: '#e7fff9', bellyStart: '#fffdf2', bellyEnd: '#e9f1dc', cheek: '#f1a6ac', eye: '#234e57', brow: '#397a7b', accent: '#6ed5c5' },
  },
  {
    id: 'black-hawk', name: 'Hắc Ưng', price: 195,
    description: 'Bộ lông huyền bí cùng ánh mắt nghiêm nghị của một chiến binh học tập.',
    personality: 'Nghiêm nghị', mood: 'stern',
    palette: { bodyStart: '#66738d', bodyMid: '#364158', bodyEnd: '#1d2638', outline: '#111827', highlight: '#aeb9cc', bellyStart: '#e9edf2', bellyEnd: '#bfc7d2', cheek: '#9d6678', eye: '#131a2b', brow: '#0d1422', accent: '#8b9ab6' },
  },
  {
    id: 'lavender-cloud', name: 'Mây tím Lavender', price: 145,
    description: 'Mềm như mây chiều, mang nét mơ màng và một chút tinh nghịch.',
    personality: 'Mơ mộng', mood: 'dreamy',
    palette: { bodyStart: '#e4d9ff', bodyMid: '#bca7ee', bodyEnd: '#8e78ca', outline: '#725dae', highlight: '#f4efff', bellyStart: '#fff9f0', bellyEnd: '#eee2ed', cheek: '#e39fca', eye: '#4d3d72', brow: '#715b94', accent: '#bba2ef' },
  },
];

export function getFlytieeSkin(id?: string) {
  return FLYTIEE_SKINS.find((skin) => skin.id === id) ?? FLYTIEE_SKINS[0];
}

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
  { id: 'witch-hat', name: 'Mũ phù thủy tí hon', slot: 'head', price: 70, description: 'Chiếc mũ tím chóp cong dành cho phù thủy tập sự.', tone: 'indigo' },
  { id: 'pumpkin-headband', name: 'Băng đô bí ngô', slot: 'head', price: 55, description: 'Hai quả bí ngô tí hon cùng chào đêm hội.', tone: 'yellow' },
  { id: 'bat-wing-glasses', name: 'Kính cánh dơi', slot: 'eyes', price: 60, description: 'Khung kính cánh dơi tinh nghịch, không hề đáng sợ.', tone: 'indigo' },
  { id: 'vampire-bow', name: 'Nơ bá tước nhí', slot: 'neck', price: 65, description: 'Nơ đỏ cùng cổ áo tím cho một bá tước thật lịch thiệp.', tone: 'red' },
  { id: 'ghost-candy-bag', name: 'Túi kẹo ma nhỏ', slot: 'hand', price: 55, description: 'Chiếc túi ma trắng chuyên cất kẹo đêm hội.', tone: 'cyan' },
  { id: 'pumpkin-lantern', name: 'Đèn bí ngô', slot: 'hand', price: 65, description: 'Ánh đèn cam ấm áp dẫn đường đêm Halloween.', tone: 'yellow' },
  { id: 'magic-spellbook', name: 'Sách phép tập sự', slot: 'hand', price: 75, description: 'Cuốn sách phép nhỏ phát sáng cho học viên chăm chỉ.', tone: 'green' },
  { id: 'vietnam-conical-hat', name: 'Nón lá Việt Nam', slot: 'head', price: 65, description: 'Chiếc nón lá thanh thoát với dải lụa đỏ dịu dàng.', tone: 'yellow' },
  { id: 'vietnam-star-headband', name: 'Băng đô sao Việt', slot: 'head', price: 50, description: 'Băng đô đỏ nổi bật cùng ngôi sao vàng năm cánh.', tone: 'red' },
  { id: 'lotus-glasses', name: 'Kính hoa sen', slot: 'eyes', price: 55, description: 'Khung kính lấy cảm hứng từ cánh sen Việt Nam.', tone: 'coral' },
  { id: 'southern-checkered-scarf', name: 'Khăn rằn Nam Bộ', slot: 'neck', price: 50, description: 'Chiếc khăn rằn mộc mạc, gần gũi và thân thương.', tone: 'navy' },
  { id: 'vietnam-national-flag', name: 'Quốc kỳ Việt Nam', slot: 'hand', price: 65, description: 'Lá cờ đỏ sao vàng được thể hiện đúng tỷ lệ và màu sắc.', tone: 'red' },
  { id: 'dong-son-drum', name: 'Trống đồng Đông Sơn', slot: 'hand', price: 75, description: 'Họa tiết mặt trời gợi nhớ di sản văn hóa Việt.', tone: 'yellow' },
  { id: 'lotus-lantern', name: 'Đèn hoa sen', slot: 'hand', price: 60, description: 'Đóa sen hồng tỏa ánh sáng ấm áp và bình yên.', tone: 'coral' },
];

export function xpNeededForLevel(level: number) {
  return 80 + Math.max(1, level) * 20;
}

export function normalizeFlytieeProfile(value: unknown): FlytieeProfile {
  const raw = value && typeof value === 'object' ? value as Partial<FlytieeProfile> : {};
  const updatedAt = typeof raw.satietyUpdatedAt === 'string' && Number.isFinite(Date.parse(raw.satietyUpdatedAt))
    ? raw.satietyUpdatedAt
    : new Date().toISOString();

  const validSkinIds = new Set(FLYTIEE_SKINS.map((skin) => skin.id));
  const ownedSkinIds = Array.isArray(raw.ownedSkinIds)
    ? raw.ownedSkinIds.filter((id): id is string => typeof id === 'string' && validSkinIds.has(id))
    : [];
  if (!ownedSkinIds.includes('classic')) ownedSkinIds.unshift('classic');
  const equippedSkinId = typeof raw.equippedSkinId === 'string'
    && ownedSkinIds.includes(raw.equippedSkinId)
    && validSkinIds.has(raw.equippedSkinId)
    ? raw.equippedSkinId
    : 'classic';
  const validSetIds = new Set(FLYTIEE_SETS.map((set) => set.id));
  const ownedSetIds = Array.isArray(raw.ownedSetIds)
    ? raw.ownedSetIds.filter((id): id is string => typeof id === 'string' && validSetIds.has(id))
    : [];
  const equippedSetId = typeof raw.equippedSetId === 'string'
    && ownedSetIds.includes(raw.equippedSetId)
    && validSetIds.has(raw.equippedSetId)
    ? raw.equippedSetId
    : null;
  const rawDailyEvent = raw.dailyEvent && typeof raw.dailyEvent === 'object'
    ? raw.dailyEvent as Partial<FlytieeDailyEventState>
    : null;
  const dailyDate = rawDailyEvent && typeof rawDailyEvent.date === 'string' ? rawDailyEvent.date : currentDateKey();
  const studyMilestones = rawDailyEvent && Array.isArray(rawDailyEvent.studyClaimedMilestones)
    ? rawDailyEvent.studyClaimedMilestones.filter((value): value is number => [15, 45, 90].includes(Number(value)))
    : [];
  const rawChests = raw.chests && typeof raw.chests === 'object'
    ? raw.chests as Partial<FlytieeProfile['chests']>
    : null;

  return {
    version: 1,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 20) : DEFAULT_FLYTIEE_PROFILE.name,
    level: Number.isInteger(raw.level) && Number(raw.level) > 0 ? Number(raw.level) : 1,
    xp: Number.isFinite(raw.xp) && Number(raw.xp) >= 0 ? Math.floor(Number(raw.xp)) : 0,
    coins: Number.isFinite(raw.coins) && Number(raw.coins) >= 0 ? Math.floor(Number(raw.coins)) : DEFAULT_FLYTIEE_PROFILE.coins,
    satiety: Number.isFinite(raw.satiety) ? Math.min(100, Math.max(0, Number(raw.satiety))) : DEFAULT_FLYTIEE_PROFILE.satiety,
    satietyUpdatedAt: updatedAt,
    ownedAccessoryIds: Array.isArray(raw.ownedAccessoryIds) ? raw.ownedAccessoryIds.filter((id): id is string => typeof id === 'string') : [],
    equipped: equippedSetId ? {} : raw.equipped && typeof raw.equipped === 'object' ? raw.equipped : {},
    ownedSkinIds,
    equippedSkinId,
    ownedSetIds,
    equippedSetId,
    claimedMissionIds: Array.isArray(raw.claimedMissionIds) ? raw.claimedMissionIds.filter((id): id is string => typeof id === 'string').slice(-120) : [],
    chests: {
      bronze: Math.max(0, Math.floor(Number(rawChests?.bronze) || 0)),
      silver: Math.max(0, Math.floor(Number(rawChests?.silver) || 0)),
      gold: Math.max(0, Math.floor(Number(rawChests?.gold) || 0)),
    },
    dailyEvent: {
      date: dailyDate,
      streakClaimed: Boolean(rawDailyEvent?.streakClaimed),
      studyClaimedMilestones: Array.from(new Set(studyMilestones)),
      practiceCoinsClaimed: Math.min(100, Math.max(0, Math.floor(Number(rawDailyEvent?.practiceCoinsClaimed) || 0))),
      completionChestClaimed: Boolean(rawDailyEvent?.completionChestClaimed),
    },
    redeemedMailCodes: Array.isArray(raw.redeemedMailCodes)
      ? raw.redeemedMailCodes.filter((code): code is string => typeof code === 'string').slice(-100)
      : [],
  };
}
