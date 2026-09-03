import { InvoiceData } from '../types';

export const generateInvoiceHTML = (data: InvoiceData): string => {
  const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

  const formatDateBadge = (dateStr: string): string => {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  };

  const dateBadges = data.sessionDates
    .map(
      (d) => `<span style="
        display: inline-block;
        background: #ccfbf1;
        color: #0f766e;
        font-size: 13px;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: 999px;
        letter-spacing: 0.3px;
      ">${formatDateBadge(d)}</span>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo cáo học tập - ${data.studentName}</title>
</head>
<body style="
  margin: 0;
  padding: 24px 16px;
  font-family: Arial, 'Helvetica Neue', sans-serif;
  background: #f8fafb;
  color: #1e293b;
  line-height: 1.6;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
">
<div style="
  max-width: 800px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  overflow: hidden;
">

  <!-- ===== HEADER ===== -->
  <div style="
    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
    padding: 32px 36px 28px;
    color: #ffffff;
  ">
    <h1 style="
      margin: 0 0 6px 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    ">Báo cáo học tập &amp; Phiếu báo học phí</h1>
    <p style="margin: 0; font-size: 14px; opacity: 0.9;">
      Tháng ${data.month} · Ngày xuất: ${new Date(data.generatedAt).toLocaleDateString('vi-VN')}
    </p>
    <div style="
      margin-top: 18px;
      background: rgba(255,255,255,0.18);
      border-radius: 12px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    ">
      <span style="font-size: 26px;"></span>
      <div>
        <div style="font-size: 12px; opacity: 0.85; margin-bottom: 2px;">Học sinh</div>
        <div style="font-size: 20px; font-weight: 700;">${data.studentName}</div>
      </div>
    </div>
  </div>

  <!-- ===== CONTENT BODY ===== -->
  <div style="padding: 28px 36px 36px;">

    <!-- ===== SECTION 1: LỘ TRÌNH HỌC TẬP ===== -->
    <div style="margin-bottom: 28px;">
      <h2 style="
        font-size: 17px;
        font-weight: 700;
        color: #0f766e;
        margin: 0 0 14px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #ccfbf1;
      ">Lộ trình học tập</h2>
      <div style="display: flex; gap: 16px;">
        <!-- Nội dung đang học -->
        <div style="
          flex: 1;
          background: #f0fdfa;
          border-radius: 16px;
          padding: 20px;
          border-left: 4px solid #0d9488;
        ">
          <div style="
            font-size: 13px;
            font-weight: 700;
            color: #0d9488;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          ">Nội dung đang học</div>
          <div style="font-size: 14px; color: #334155; white-space: pre-line;">${data.currentLearning || 'Chưa cập nhật'}</div>
        </div>
        <!-- Kế hoạch tiếp theo -->
        <div style="
          flex: 1;
          background: #f0f9ff;
          border-radius: 16px;
          padding: 20px;
          border-left: 4px solid #0ea5e9;
        ">
          <div style="
            font-size: 13px;
            font-weight: 700;
            color: #0284c7;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          ">Kế hoạch tiếp theo</div>
          <div style="font-size: 14px; color: #334155; white-space: pre-line;">${data.upcomingPlan || 'Chưa cập nhật'}</div>
        </div>
      </div>
    </div>

    <!-- ===== SECTION 2: NHẬN XÉT CỦA GIA SƯ ===== -->
    <div style="margin-bottom: 28px;">
      <h2 style="
        font-size: 17px;
        font-weight: 700;
        color: #0f766e;
        margin: 0 0 14px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #ccfbf1;
      ">Nhận xét của gia sư</h2>
      <div style="display: flex; gap: 16px;">
        <!-- Mặt tích cực -->
        <div style="
          flex: 1;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 16px;
          padding: 20px;
        ">
          <div style="
            font-size: 14px;
            font-weight: 700;
            color: #16a34a;
            margin-bottom: 10px;
          ">Mặt tích cực</div>
          <div style="font-size: 14px; color: #334155; white-space: pre-line;">${data.positiveReview || 'Chưa có nhận xét'}</div>
        </div>
        <!-- Điểm cần rèn luyện -->
        <div style="
          flex: 1;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 16px;
          padding: 20px;
        ">
          <div style="
            font-size: 14px;
            font-weight: 700;
            color: #d97706;
            margin-bottom: 10px;
          ">Điểm cần rèn luyện</div>
          <div style="font-size: 14px; color: #334155; white-space: pre-line;">${data.improvementReview || 'Chưa có nhận xét'}</div>
        </div>
      </div>
    </div>

    <!-- ===== SECTION 3: NHẬT KÝ BUỔI HỌC ===== -->
    <div style="margin-bottom: 28px;">
      <h2 style="
        font-size: 17px;
        font-weight: 700;
        color: #0f766e;
        margin: 0 0 14px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #ccfbf1;
      ">Nhật ký buổi học</h2>
      <div style="
        background: #f8fafc;
        border-radius: 16px;
        padding: 20px;
        border: 1px solid #e2e8f0;
      ">
        <div style="margin-bottom: 12px;">
          <span style="
            font-size: 14px;
            color: #64748b;
          ">Tổng số buổi học trong tháng: </span>
          <span style="
            display: inline-block;
            background: #0d9488;
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
            padding: 3px 14px;
            border-radius: 999px;
          ">${data.sessionsAttended} buổi</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px;">
          ${dateBadges || '<span style="font-size: 14px; color: #94a3b8;">Chưa có dữ liệu buổi học</span>'}
        </div>
      </div>
    </div>

    <!-- ===== SECTION 4: HỌC PHÍ ===== -->
    <div style="margin-bottom: 28px;">
      <h2 style="
        font-size: 17px;
        font-weight: 700;
        color: #0f766e;
        margin: 0 0 14px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #ccfbf1;
      ">Học phí</h2>

      <!-- Fee Table -->
      <table style="
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        margin-bottom: 16px;
        font-size: 14px;
      ">
        <thead>
          <tr>
            <th style="background: #f0fdfa; color: #0f766e; padding: 12px 16px; text-align: left; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Chi tiết</th>
            <th style="background: #f0fdfa; color: #0f766e; padding: 12px 16px; text-align: right; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Số buổi</th>
            <th style="background: #f0fdfa; color: #0f766e; padding: 12px 16px; text-align: right; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Đơn giá</th>
            <th style="background: #f0fdfa; color: #0f766e; padding: 12px 16px; text-align: right; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155;">Học phí trong tháng</td>
            <td style="padding: 12px 16px; text-align: right; border-bottom: 1px solid #f1f5f9; color: #334155;">${data.sessionsAttended} buổi</td>
            <td style="padding: 12px 16px; text-align: right; border-bottom: 1px solid #f1f5f9; color: #334155;">${formatter.format(data.feePerSession)}</td>
            <td style="padding: 12px 16px; text-align: right; border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 600;">${formatter.format(data.subtotal)}</td>
          </tr>${data.adjustment !== 0 ? `
          <tr>
            <td colspan="3" style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Điều chỉnh${data.adjustmentNote ? ` (${data.adjustmentNote})` : ''}</td>
            <td style="padding: 12px 16px; text-align: right; border-bottom: 1px solid #f1f5f9; color: ${data.adjustment > 0 ? '#dc2626' : '#16a34a'}; font-weight: 600;">${data.adjustment > 0 ? '+' : ''}${formatter.format(data.adjustment)}</td>
          </tr>` : ''}
          <tr>
            <td colspan="3" style="padding: 14px 16px; font-weight: 700; font-size: 15px; color: #0f172a; background: #f8fafc;">TỔNG CỘNG</td>
            <td style="padding: 14px 16px; text-align: right; font-weight: 700; font-size: 18px; color: #dc2626; background: #f8fafc;">${formatter.format(data.total)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Bank Transfer Info -->
      <div style="
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 16px;
        padding: 20px 24px;
        display: flex;
        align-items: flex-start;
        gap: 20px;
      ">
        <div style="flex: 1;">
          <div style="
            font-size: 14px;
            font-weight: 700;
            color: #0f766e;
            margin-bottom: 12px;
          ">Thông tin chuyển khoản</div>
          <table style="font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 12px 4px 0; color: #64748b; white-space: nowrap;">Ngân hàng:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #334155;">${data.bankInfo.bankName || 'Chưa cập nhật'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 12px 4px 0; color: #64748b; white-space: nowrap;">Số TK:</td>
              <td style="padding: 4px 0; font-weight: 600; letter-spacing: 0.5px; color: #334155;">${data.bankInfo.accountNumber || 'Chưa cập nhật'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 12px 4px 0; color: #64748b; white-space: nowrap;">Chủ TK:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #334155;">${data.bankInfo.accountHolder || 'Chưa cập nhật'}</td>
            </tr>
          </table>
        </div>
        ${data.bankInfo.qrImageUrl ? `
        <div style="
          flex-shrink: 0;
          width: 130px;
          height: 130px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img src="${data.bankInfo.qrImageUrl}" alt="QR Code chuyển khoản" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />
        </div>` : ''}
      </div>
    </div>

    <!-- ===== SECTION 5: LỜI CẢM ƠN ===== -->
    <div style="
      text-align: center;
      padding: 24px 20px;
      background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%);
      border-radius: 16px;
      margin-top: 8px;
    ">
      
      <div style="
        font-size: 15px;
        color: #0f766e;
        font-weight: 600;
        margin-bottom: 6px;
      ">Cảm ơn Quý Phụ Huynh!</div>
      <div style="
        font-size: 13px;
        color: #64748b;
        max-width: 480px;
        margin: 0 auto;
        line-height: 1.7;
      ">Cảm ơn Anh/Chị đã tin tưởng và đồng hành cùng con trong quá trình học tập. Mọi thắc mắc vui lòng liên hệ trực tiếp với gia sư để được hỗ trợ.</div>
    </div>

  </div>
</div>
</body>
</html>`;
};