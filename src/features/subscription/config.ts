import type { AccountTier, PaidPlan, PaidPlanCode } from './types';

export const ACCOUNT_TIER_META: Record<AccountTier, {
  name: string;
  shortDescription: string;
}> = {
  flygo: {
    name: 'FlyGo',
    shortDescription: 'Tài khoản miễn phí',
  },
  flymax: {
    name: 'FlyMax',
    shortDescription: 'Tài khoản Pro có thời hạn',
  },
  flyinfinity: {
    name: 'FlyInfinity',
    shortDescription: 'Tài khoản trọn đời',
  },
};

export const PAID_PLANS: Record<PaidPlanCode, PaidPlan> = {
  flymax_monthly: {
    code: 'flymax_monthly',
    name: 'FlyMax',
    billingLabel: '1 tháng',
    price: 29_000,
    durationDays: 30,
  },
  flymax_yearly: {
    code: 'flymax_yearly',
    name: 'FlyMax',
    billingLabel: '1 năm',
    price: 199_000,
    durationDays: 365,
  },
  flyinfinity: {
    code: 'flyinfinity',
    name: 'FlyInfinity',
    billingLabel: 'Trọn đời',
    price: 299_000,
    durationDays: null,
  },
};

export const FLYGO_FEATURES = [
  'Luyện tập miễn phí toàn bộ Level 1 và Level 2',
  'Trải nghiệm một số đề thi thử được chọn',
  'Đọc Cẩm nang học tập FlyDo',
  'Theo dõi mục tiêu ngày và chuỗi ngày học',
];

export const PREMIUM_FEATURES = [
  'Toàn bộ quyền lợi của FlyGo',
  'Mở khóa toàn bộ bài luyện, bao gồm Level 3',
  'Mở toàn bộ ngân hàng đề thi thử',
  'Sổ câu sai và danh sách câu hỏi đã lưu',
  'Lời giải chi tiết và thống kê học tập đầy đủ',
  'Ưu tiên trải nghiệm các tính năng mới',
];

export const FAQ_ITEMS = [
  {
    question: 'FlyGo có thực sự miễn phí không?',
    answer: 'Có. FlyGo cho phép bạn luyện tập miễn phí toàn bộ Level 1, Level 2, đọc Cẩm nang và làm một số đề thi thử được chọn. Bạn chỉ cần đăng ký tài khoản để lưu tiến trình học.',
  },
  {
    question: 'FlyMax tháng và FlyMax năm khác nhau thế nào?',
    answer: 'Hai lựa chọn có cùng đặc quyền. Điểm khác biệt là thời hạn sử dụng: gói tháng phù hợp để trải nghiệm ngắn hạn, còn gói năm tiết kiệm hơn nếu bạn học thường xuyên.',
  },
  {
    question: 'FlyInfinity có phát sinh phí gia hạn không?',
    answer: 'Không. FlyInfinity là gói trọn đời, thanh toán một lần và không cần gia hạn. Quyền truy cập được gắn với tài khoản đã mua.',
  },
  {
    question: 'Khi FlyMax hết hạn, dữ liệu học tập có bị mất không?',
    answer: 'Không. Tài khoản sẽ trở về FlyGo nhưng tiến trình, kết quả và dữ liệu học tập vẫn được giữ lại. Bạn có thể tiếp tục sử dụng khi gia hạn FlyMax hoặc nâng cấp FlyInfinity.',
  },
  {
    question: 'Mã quà tặng hoạt động như thế nào?',
    answer: 'Mỗi mã quà tặng có số ngày FlyMax và điều kiện sử dụng riêng. Sau khi nhập mã hợp lệ, thời hạn mới sẽ được cộng nối tiếp vào thời hạn FlyMax còn lại của bạn.',
  },
  {
    question: 'Sau khi chuyển khoản bao lâu tài khoản được nâng cấp?',
    answer: 'Ở giai đoạn thanh toán thủ công, FlyDo sẽ kiểm tra nội dung chuyển khoản và kích hoạt tài khoản sau khi xác nhận. Thời gian xử lý cụ thể sẽ được cập nhật khi hệ thống chính thức mở bán.',
  },
  {
    question: 'Tôi có thể chuyển gói sang tài khoản khác không?',
    answer: 'Mặc định, gói đã kích hoạt được gắn với tài khoản mua và không thể tự chuyển. Nếu nhập nhầm tài khoản, bạn có thể liên hệ hỗ trợ để được kiểm tra.',
  },
];
