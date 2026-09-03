const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2];

const files = {
  'src/features/teacher-dashboard/types.ts': `
export type DashboardStats = { totalClasses: number; totalStudents: number; totalExams: number; flaggedQuestions: number; };
export type FlaggedQuestion = { examId: string; examTitle: string; questionNumber: number; studentId: string; studentName: string; flaggedAt: string; };
`,
  'src/features/teacher-dashboard/hooks/use-teacher-dashboard.ts': `
import { DashboardStats, FlaggedQuestion } from '../types';

export const useTeacherDashboard = () => {
  const stats: DashboardStats = { totalClasses: 3, totalStudents: 12, totalExams: 5, flaggedQuestions: 8 };
  const flaggedQuestions: FlaggedQuestion[] = [
    { examId: 'e1', examTitle: 'Kiểm tra Toán 15 phút', questionNumber: 3, studentId: 's1', studentName: 'Nguyễn Văn A', flaggedAt: new Date().toISOString() },
    { examId: 'e2', examTitle: 'Giữa kì 1 Lý', questionNumber: 12, studentId: 's2', studentName: 'Trần Thị B', flaggedAt: new Date().toISOString() }
  ];
  return { stats, flaggedQuestions, recentExams: [] };
};
`,
  'src/features/teacher-dashboard/components/dashboard-overview.tsx': `
'use client';
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, FileText, Flag } from "lucide-react";
import { useTeacherDashboard } from "../hooks/use-teacher-dashboard";
import { cn } from "@/lib/utils";

export const DashboardOverview = () => {
  const { stats } = useTeacherDashboard();
  const items = [
    { label: 'Lớp học', value: stats.totalClasses, icon: Users, color: 'text-blue-500' },
    { label: 'Học sinh', value: stats.totalStudents, icon: GraduationCap, color: 'text-emerald-500' },
    { label: 'Đề thi', value: stats.totalExams, icon: FileText, color: 'text-purple-500' },
    { label: 'Câu hỏi cờ đỏ', value: stats.flaggedQuestions, icon: Flag, color: 'text-red-500', onClick: () => document.getElementById('flagged-questions')?.scrollIntoView({behavior: 'smooth'}) }
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, i) => (
        <Card key={i} className={cn("rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5", item.onClick && "cursor-pointer")} onClick={item.onClick}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <h3 className="text-3xl font-bold mt-1">{item.value}</h3>
            </div>
            <div className={cn("p-3 rounded-full bg-primary/10", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
`,
  'src/features/teacher-dashboard/components/class-management.tsx': `
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Settings, Bell, Copy, ChevronDown } from "lucide-react";
import { useState } from "react";

const MOCK_CLASSES = [
  { id: 'c1', name: 'Toán 10A1', studentCount: 4, inviteCode: 'T10A1-XYZ' },
  { id: 'c2', name: 'Lý 11B', studentCount: 5, inviteCode: 'L11B-ABC' },
  { id: 'c3', name: 'Hóa 12C', studentCount: 3, inviteCode: 'H12C-DEF' }
];

export const ClassManagement = () => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Đã copy mã mời: ' + code);
  };

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Users className="w-5 h-5 text-primary" />
          Quản lý lớp học
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {MOCK_CLASSES.map(cls => (
          <div key={cls.id} className="p-4 border rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">{cls.name}</h4>
                <p className="text-sm text-muted-foreground">{cls.studentCount} học sinh • ID: {cls.id}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingId(cls.id === editingId ? null : cls.id)}>
                  <Settings className="w-4 h-4 mr-1" /> Chỉnh sửa
                </Button>
                <Button variant="secondary" size="sm">
                  <Bell className="w-4 h-4 mr-1" /> Thông báo
                </Button>
              </div>
            </div>
            {editingId === cls.id && (
              <div className="pt-3 border-t flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <Input defaultValue={cls.name} placeholder="Tên lớp" className="max-w-[200px]" />
                  <Input type="password" placeholder="Mật khẩu mới (tùy chọn)" className="max-w-[200px]" />
                  <Button size="sm">Lưu</Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Mã mời:</span>
                  <code className="bg-muted px-2 py-1 rounded">{cls.inviteCode}</code>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(cls.inviteCode)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            <Button variant="ghost" size="sm" className="w-full mt-1 text-muted-foreground flex justify-between">
              <span>Xem danh sách học sinh</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
`,
  'src/features/teacher-dashboard/components/flagged-questions.tsx': `
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, CheckCircle2, Clock } from "lucide-react";
import { useTeacherDashboard } from "../hooks/use-teacher-dashboard";
import { useState } from "react";

export const FlaggedQuestions = () => {
  const { flaggedQuestions: initialFlags } = useTeacherDashboard();
  const [flags, setFlags] = useState(initialFlags);

  const handleDismiss = (id: string, qNum: number) => {
    setFlags(flags.filter(f => !(f.examId === id && f.questionNumber === qNum)));
  };

  const grouped = flags.reduce((acc, curr) => {
    if (!acc[curr.examTitle]) acc[curr.examTitle] = [];
    acc[curr.examTitle].push(curr);
    return acc;
  }, {} as Record<string, typeof initialFlags>);

  return (
    <Card id="flagged-questions" className="rounded-2xl border border-border bg-card shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Flag className="w-5 h-5 text-red-500" />
          Câu hỏi cần giải đáp
          <Badge variant="destructive" className="ml-auto">{flags.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {flags.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 opacity-50" />
            <p>Không có câu hỏi nào cần giải đáp.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([exam, items]) => (
              <div key={exam} className="space-y-3">
                <h4 className="font-semibold text-primary">{exam}</h4>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div>
                        <p className="font-medium">Câu {item.questionNumber} <span className="text-muted-foreground font-normal text-sm ml-2">- {item.studentName}</span></p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" /> {new Date(item.flaggedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleDismiss(item.examId, item.questionNumber)}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Đã giải đáp
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
`,
  'src/features/teacher-dashboard/components/resource-manager.tsx': `
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, FileQuestion, Plus, Trash2 } from "lucide-react";

export const ResourceManager = () => {
  const sections = [
    { title: 'Tài liệu', icon: FileText, items: [{ title: 'Đề cương ôn tập HK1', date: '10/10/2023' }] },
    { title: 'Video', icon: Video, items: [{ title: 'Bài giảng Phương trình bậc 2', date: '12/10/2023' }] },
    { title: 'Đề thi', icon: FileQuestion, items: [{ title: 'Đề thi thử lần 1', date: '15/10/2023' }] },
  ];

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm mt-8">
      <CardHeader>
        <CardTitle className="text-xl">Quản lý Tài nguyên</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map(sec => (
            <div key={sec.title} className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <sec.icon className="w-4 h-4 text-primary" /> {sec.title}
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {sec.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group">
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {sec.items.length === 0 && <p className="text-sm text-muted-foreground italic">Chưa có dữ liệu</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
`,
  'src/app/teacher/page.tsx': `
'use client';
import { PageHeader } from "@/components/shared/page-header";
import { DashboardOverview } from "@/features/teacher-dashboard/components/dashboard-overview";
import { ClassManagement } from "@/features/teacher-dashboard/components/class-management";
import { FlaggedQuestions } from "@/features/teacher-dashboard/components/flagged-questions";
import { ResourceManager } from "@/features/teacher-dashboard/components/resource-manager";

export default function TeacherDashboardPage() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <PageHeader title="Bảng quản trị Giáo viên" description="Tổng quan và quản lý lớp học của bạn" />
      <DashboardOverview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ClassManagement />
        <FlaggedQuestions />
      </div>
      <ResourceManager />
    </div>
  );
}
`,
  'src/app/teacher/[classId]/page.tsx': `
'use client';
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { Users, FileEdit, BarChart } from "lucide-react";

export default function TeacherClassPage() {
  const params = useParams();
  const router = useRouter();
  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PageHeader title={\`Lớp học \${params.classId}\`} />
          <Badge className="bg-primary hover:bg-primary/90 mt-2">Quản lý</Badge>
        </div>
        <Button onClick={() => router.push(\`/teacher/\${params.classId}/manage\`)}>
          <FileEdit className="w-4 h-4 mr-2" /> Quản trị chi tiết
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300"><Users /></div>
            <div><h3 className="font-semibold">Điểm danh</h3><p className="text-sm text-muted-foreground">Quản lý chuyên cần</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-600 dark:text-purple-300"><FileEdit /></div>
            <div><h3 className="font-semibold">Viết nhận xét</h3><p className="text-sm text-muted-foreground">Đánh giá định kì</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full text-emerald-600 dark:text-emerald-300"><BarChart /></div>
            <div><h3 className="font-semibold">Báo cáo</h3><p className="text-sm text-muted-foreground">Xem kết quả học tập</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`,
  'src/features/tuition/types.ts': `
export type TuitionConfig = { classId: string; feePerSession: number; bankName: string; accountNumber: string; accountHolder: string; qrImageUrl: string | null; };
export type InvoiceData = { studentId: string; studentName: string; month: string; sessionsAttended: number; feePerSession: number; subtotal: number; adjustment: number; adjustmentNote: string; total: number; teacherReview: string; bankInfo: { bankName: string; accountNumber: string; accountHolder: string; qrImageUrl: string | null; }; generatedAt: string; };
`,
  'src/features/tuition/hooks/use-fee-calculator.ts': `
import { useState } from 'react';
import { InvoiceData } from '../types';

export const useFeeCalculator = () => {
  const [feePerSession, setFeePerSession] = useState(100000);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedClassId, setSelectedClassId] = useState('c1');

  // Mock students
  const students = [
    { id: 's1', name: 'Nguyễn Văn A', sessions: 8 },
    { id: 's2', name: 'Trần Thị B', sessions: 7 },
    { id: 's3', name: 'Lê Văn C', sessions: 9 }
  ];

  const calculateForStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const sessions = student ? student.sessions : 0;
    const subtotal = sessions * feePerSession;
    return { sessions, subtotal, adjustment: 0, total: subtotal };
  };

  const calculateForAllStudents = (): Partial<InvoiceData>[] => {
    return students.map(s => {
      const { sessions, subtotal, adjustment, total } = calculateForStudent(s.id);
      return { studentId: s.id, studentName: s.name, sessionsAttended: sessions, subtotal, adjustment, total, feePerSession, month: selectedMonth };
    });
  };

  return { feePerSession, setFeePerSession, selectedMonth, setSelectedMonth, selectedClassId, setSelectedClassId, calculateForStudent, calculateForAllStudents, students };
};
`,
  'src/features/tuition/hooks/use-invoice.ts': `
import { InvoiceData } from '../types';
import { generateInvoiceHTML } from '../utils/invoice-generator';

export const useInvoice = () => {
  const generateInvoice = (data: InvoiceData) => generateInvoiceHTML(data);
  const printInvoice = (data: InvoiceData) => {
    const html = generateInvoiceHTML(data);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => { w.print(); }, 500);
    }
  };
  const downloadInvoice = (data: InvoiceData) => {
    const html = generateInvoiceHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`phieu-thu-\${data.studentName.replace(/ /g, '-')}-\${data.month}.html\`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return { generateInvoice, printInvoice, downloadInvoice };
};
`,
  'src/features/tuition/utils/invoice-generator.ts': `
import { InvoiceData } from '../types';

export const generateInvoiceHTML = (data: InvoiceData): string => {
  const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
  return \`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Phiếu Thu Học Phí - \${data.studentName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0d9488; padding-bottom: 15px; }
        .header h1 { color: #0d9488; margin: 0; font-size: 24px; text-transform: uppercase; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .info-label { font-weight: bold; width: 150px; display: inline-block; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f0fdfa; color: #0f766e; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { font-size: 18px; font-weight: bold; color: #b91c1c; margin-top: 10px; }
        .bank-info { margin-top: 30px; padding: 15px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; display: flex; justify-content: space-between; }
        .bank-details { flex: 1; }
        .qr-code { width: 120px; height: 120px; border: 1px solid #ddd; padding: 5px; background: #fff; }
        .footer { margin-top: 40px; text-align: right; padding-right: 50px; }
        .signature { margin-top: 60px; font-weight: bold; }
        @media print { body { padding: 0; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>PHIẾU THU HỌC PHÍ</h1>
        <p>Tháng: \${data.month} | Ngày xuất: \${new Date(data.generatedAt).toLocaleDateString('vi-VN')}</p>
      </div>
      <div>
        <p><span class="info-label">Họ tên học sinh:</span> <strong>\${data.studentName}</strong></p>
        <p><span class="info-label">Nhận xét:</span> \${data.teacherReview || 'Chưa có nhận xét'}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Chi tiết</th>
            <th style="text-align: right;">Số lượng</th>
            <th style="text-align: right;">Đơn giá</th>
            <th style="text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Học phí trong tháng</td>
            <td style="text-align: right;">\${data.sessionsAttended} buổi</td>
            <td style="text-align: right;">\${formatter.format(data.feePerSession)}</td>
            <td style="text-align: right;">\${formatter.format(data.subtotal)}</td>
          </tr>
          \${data.adjustment !== 0 ? \`
          <tr>
            <td colspan="3">Điều chỉnh (\${data.adjustmentNote || 'Khác'})</td>
            <td style="text-align: right;">\${formatter.format(data.adjustment)}</td>
          </tr>
          \` : ''}
        </tbody>
      </table>
      <div class="totals">
        <div class="total-row">TỔNG CỘNG: \${formatter.format(data.total)}</div>
      </div>
      <div class="bank-info">
        <div class="bank-details">
          <h3 style="margin-top: 0; color: #0f766e;">Thông tin thanh toán chuyển khoản</h3>
          <p>Ngân hàng: <strong>\${data.bankInfo.bankName || 'Chưa cập nhật'}</strong></p>
          <p>Số tài khoản: <strong>\${data.bankInfo.accountNumber || 'Chưa cập nhật'}</strong></p>
          <p>Chủ tài khoản: <strong>\${data.bankInfo.accountHolder || 'Chưa cập nhật'}</strong></p>
          <p><i>Nội dung CK: Học phí [Tên học sinh] tháng \${data.month}</i></p>
        </div>
        \${data.bankInfo.qrImageUrl ? \`<img class="qr-code" src="\${data.bankInfo.qrImageUrl}" alt="QR Code" />\` : ''}
      </div>
      <div class="footer">
        <p>Giáo viên/Người thu tiền</p>
        <div class="signature">(Ký, ghi rõ họ tên)</div>
      </div>
      <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #0d9488; color: #fff; border: none; border-radius: 4px; cursor: pointer;">In phiếu thu</button>
    </body>
    </html>
  \`;
};
`,
  'src/features/tuition/components/fee-adjustment.tsx': `
'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const FeeAdjustment = ({ subtotal, onChange }: { subtotal: number, onChange: (adj: number, note: string) => void }) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>Số tiền điều chỉnh (VND) - Có thể nhập số âm</Label>
        <Input type="number" onChange={(e) => onChange(Number(e.target.value) || 0, '')} placeholder="Ví dụ: -50000 hoặc 50000" />
      </div>
      <div className="grid gap-2">
        <Label>Ghi chú điều chỉnh</Label>
        <Textarea placeholder="Lý do: Giảm giá, nghỉ có phép, tài liệu..." onChange={(e) => onChange(0, e.target.value)} />
      </div>
      <div className="p-3 bg-muted rounded-md text-sm text-center">
        Tạm tính: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
      </div>
    </div>
  );
};
`,
  'src/features/tuition/components/invoice-template.tsx': `
'use client';
import { InvoiceData } from '../types';
import { generateInvoiceHTML } from '../utils/invoice-generator';

export const InvoiceTemplate = ({ data }: { data: InvoiceData }) => {
  return (
    <div className="w-full h-full bg-white text-black p-4 rounded-md overflow-auto shadow-inner"
         dangerouslySetInnerHTML={{ __html: generateInvoiceHTML(data) }} />
  );
};
`,
  'src/features/tuition/components/invoice-preview.tsx': `
'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceData } from '../types';
import { InvoiceTemplate } from './invoice-template';
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { useInvoice } from "../hooks/use-invoice";

export const InvoicePreview = ({ data, open, onOpenChange }: { data: InvoiceData | null, open: boolean, onOpenChange: (o: boolean) => void }) => {
  const { printInvoice, downloadInvoice } = useInvoice();
  
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Xem trước Phiếu Thu</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-gray-100 p-4 rounded-md">
          <InvoiceTemplate data={data} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => downloadInvoice(data)}>
            <Download className="w-4 h-4 mr-2" /> Tải về
          </Button>
          <Button onClick={() => printInvoice(data)}>
            <Printer className="w-4 h-4 mr-2" /> In phiếu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
`,
  'src/features/tuition/components/qr-code-upload.tsx': `
'use client';
import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

export const QrCodeUpload = ({ onUpload }: { onUpload: (dataUrl: string | null) => void }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreview(result);
        onUpload(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 border-2 border-dashed border-border rounded-xl p-6 text-center">
      {preview ? (
        <div className="relative">
          <img src={preview} alt="QR Code" className="w-32 h-32 object-contain bg-white rounded-md shadow-sm p-1" />
          <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => { setPreview(null); onUpload(null); }}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <>
          <div className="p-3 bg-muted rounded-full text-muted-foreground"><Upload className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium">Tải lên mã QR thanh toán</p>
            <p className="text-xs text-muted-foreground mt-1">Chỉ chấp nhận file ảnh</p>
          </div>
          <input type="file" accept="image/*" className="hidden" id="qr-upload" onChange={handleFileChange} />
          <Button variant="outline" size="sm" asChild>
            <label htmlFor="qr-upload" className="cursor-pointer">Chọn ảnh</label>
          </Button>
        </>
      )}
    </div>
  );
};
`,
  'src/features/tuition/components/bank-info-form.tsx': `
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard, Save } from "lucide-react";
import { QrCodeUpload } from "./qr-code-upload";
import { useState } from "react";

export const BankInfoForm = () => {
  const [isSaved, setIsSaved] = useState(false);
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="w-5 h-5 text-primary" /> Thông tin thanh toán (Bank)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Tên ngân hàng</Label>
              <Input placeholder="VD: Vietcombank" />
            </div>
            <div className="grid gap-2">
              <Label>Số tài khoản</Label>
              <Input placeholder="VD: 0123456789" />
            </div>
            <div className="grid gap-2">
              <Label>Tên chủ tài khoản</Label>
              <Input placeholder="VD: NGUYEN VAN A" />
            </div>
            <Button className="w-full mt-2" onClick={() => setIsSaved(true)}>
              <Save className="w-4 h-4 mr-2" /> {isSaved ? 'Đã lưu' : 'Lưu thông tin'}
            </Button>
          </div>
          <div>
            <Label className="block mb-2">Mã QR Thanh toán</Label>
            <QrCodeUpload onUpload={(url) => console.log('QR updated')} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
`,
  'src/features/tuition/components/fee-calculator.tsx': `
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, FileText } from "lucide-react";
import { useFeeCalculator } from "../hooks/use-fee-calculator";
import { InvoiceData } from "../types";
import { InvoicePreview } from "./invoice-preview";
import { useState } from "react";
import { FeeAdjustment } from "./fee-adjustment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const FeeCalculator = () => {
  const { feePerSession, setFeePerSession, selectedMonth, setSelectedMonth, students, calculateForStudent } = useFeeCalculator();
  const [previewData, setPreviewData] = useState<InvoiceData | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [adjAmount, setAdjAmount] = useState(0);
  const [adjNote, setAdjNote] = useState('');

  const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

  const handleExportClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setAdjAmount(0);
    setAdjNote('');
  };

  const confirmExport = () => {
    if (!selectedStudentId) return;
    const calc = calculateForStudent(selectedStudentId);
    const s = students.find(x => x.id === selectedStudentId);
    if (!s) return;
    
    setPreviewData({
      studentId: s.id,
      studentName: s.name,
      month: selectedMonth,
      sessionsAttended: calc.sessions,
      feePerSession,
      subtotal: calc.subtotal,
      adjustment: adjAmount,
      adjustmentNote: adjNote,
      total: calc.subtotal + adjAmount,
      teacherReview: 'Học sinh chăm ngoan, hoàn thành bài tập đầy đủ.',
      bankInfo: { bankName: 'Vietcombank', accountNumber: '123456789', accountHolder: 'GIÁO VIÊN', qrImageUrl: null },
      generatedAt: new Date().toISOString()
    });
    setSelectedStudentId(null);
  };

  return (
    <Card className="rounded-2xl shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calculator className="w-5 h-5 text-primary" /> Tính học phí
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Lớp học</Label>
            <Select defaultValue="c1">
              <SelectTrigger><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="c1">Toán 10A1</SelectItem>
                <SelectItem value="c2">Lý 11B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Tháng</Label>
            <Input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Mức học phí / buổi (VND)</Label>
            <Input type="number" value={feePerSession} onChange={e => setFeePerSession(Number(e.target.value))} />
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Họ tên học sinh</th>
                <th className="px-4 py-3 font-medium text-center">Số buổi học</th>
                <th className="px-4 py-3 font-medium text-right">Thành tiền</th>
                <th className="px-4 py-3 font-medium text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map(s => {
                const { subtotal } = calculateForStudent(s.id);
                return (
                  <tr key={s.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-center">{calculateForStudent(s.id).sessions}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-semibold">{formatter.format(subtotal)}</td>
                    <td className="px-4 py-3 text-center">
                      <Button size="sm" onClick={() => handleExportClick(s.id)}>
                        <FileText className="w-4 h-4 mr-1" /> Xuất phiếu
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Dialog open={!!selectedStudentId} onOpenChange={o => !o && setSelectedStudentId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Điều chỉnh học phí</DialogTitle></DialogHeader>
            <FeeAdjustment 
              subtotal={selectedStudentId ? calculateForStudent(selectedStudentId).subtotal : 0} 
              onChange={(a, n) => { setAdjAmount(a); if(n) setAdjNote(n); }} 
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedStudentId(null)}>Hủy</Button>
              <Button onClick={confirmExport}>Xác nhận xuất</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <InvoicePreview data={previewData} open={!!previewData} onOpenChange={(o) => !o && setPreviewData(null)} />
      </CardContent>
    </Card>
  );
};
`,
  'src/app/teacher/tuition/page.tsx': `
'use client';
import { PageHeader } from "@/components/shared/page-header";
import { BankInfoForm } from "@/features/tuition/components/bank-info-form";
import { FeeCalculator } from "@/features/tuition/components/fee-calculator";

export default function TuitionManagementPage() {
  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      <PageHeader title="Quản lý Học phí" description="Tính toán và xuất phiếu thu cho học sinh" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <BankInfoForm />
        </div>
        <div className="xl:col-span-2">
          <FeeCalculator />
        </div>
      </div>
    </div>
  );
}
`,
  'src/app/teacher/[classId]/manage/page.tsx': `
'use client';
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceManager } from "@/features/teacher-dashboard/components/resource-manager";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { Settings, Users, FileText, FileQuestion } from "lucide-react";

export default function ClassManagePage() {
  const params = useParams();
  const classId = params.classId as string;

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      <PageHeader title={\`Quản trị chi tiết - Lớp \${classId}\`} />
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="info"><Settings className="w-4 h-4 mr-2" /> Thông tin</TabsTrigger>
          <TabsTrigger value="students"><Users className="w-4 h-4 mr-2" /> Học sinh</TabsTrigger>
          <TabsTrigger value="resources"><FileText className="w-4 h-4 mr-2" /> Tài liệu</TabsTrigger>
          <TabsTrigger value="exams"><FileQuestion className="w-4 h-4 mr-2" /> Đề thi</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-4 max-w-md">
              <h3 className="text-lg font-semibold">Chỉnh sửa thông tin lớp</h3>
              <div>
                <label className="text-sm font-medium">Tên lớp</label>
                <Input defaultValue={\`Lớp \${classId}\`} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Mã tham gia</label>
                <Input defaultValue={\`\${classId}-XYZ\`} readOnly className="mt-1 bg-muted" />
              </div>
              <Button>Lưu thay đổi</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Danh sách học sinh</h3>
              <div className="text-muted-foreground text-sm">Hiển thị danh sách học sinh kèm trạng thái hoạt động ở đây.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <ResourceManager />
        </TabsContent>

        <TabsContent value="exams" className="mt-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center py-12">
              <FileQuestion className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground mb-4">Lớp này chưa có đề thi nào</p>
              <Button>Tạo đề thi mới</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\\n');
}
console.log("All files created successfully!");
