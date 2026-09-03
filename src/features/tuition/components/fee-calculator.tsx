'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, FileText } from "lucide-react";
import { useFeeCalculator } from "../hooks/use-fee-calculator";
import { InvoiceData } from "../types";
import { InvoicePreview } from "./invoice-preview";
import { useState } from "react";
import { FeeAdjustment } from "./fee-adjustment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useBankStore } from "../stores/bank-store";
import { getSupabaseClient } from "@/lib/supabase/client";

export const FeeCalculator = () => {
  const { feePerSession, setFeePerSession, selectedMonth, setSelectedMonth, students, classes, selectedClassId, setSelectedClassId, calculateForStudent } = useFeeCalculator();
  const { bankInfo } = useBankStore();
  const [previewData, setPreviewData] = useState<InvoiceData | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [adjAmount, setAdjAmount] = useState(0);
  const [adjNote, setAdjNote] = useState('');

  // New review / learning plan fields
  const [positiveReview, setPositiveReview] = useState('');
  const [improvementReview, setImprovementReview] = useState('');
  const [currentLearning, setCurrentLearning] = useState('');
  const [upcomingPlan, setUpcomingPlan] = useState('');

  const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

  const handleExportClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setAdjAmount(0);
    setAdjNote('');
    setPositiveReview('');
    setImprovementReview('');
    setCurrentLearning('');
    setUpcomingPlan('');
  };

  const confirmExport = async () => {
    if (!selectedStudentId) return;
    const calc = calculateForStudent(selectedStudentId);
    const s = students.find(x => x.id === selectedStudentId);
    if (!s) return;

    // Fetch session dates from attendance
    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const startDate = `${selectedMonth}-01`;
    const endDate = `${selectedMonth}-${String(daysInMonth).padStart(2, '0')}`;

    const supabase = getSupabaseClient();
    const { data: attendanceRows } = await supabase
      .from('attendance')
      .select('date')
      .eq('class_id', selectedClassId)
      .eq('student_id', selectedStudentId)
      .in('status', ['present', 'makeup'])
      .gte('date', startDate)
      .lte('date', endDate);

    const sessionDates = (attendanceRows ?? []).map((r: { date: string }) => r.date);

    setPreviewData({
      studentId: s.id,
      studentName: s.name,
      month: selectedMonth,
      sessionsAttended: calc.sessions,
      sessionDates,
      feePerSession,
      subtotal: calc.subtotal,
      adjustment: adjAmount,
      adjustmentNote: adjNote,
      total: calc.subtotal + adjAmount,
      positiveReview,
      improvementReview,
      currentLearning,
      upcomingPlan,
      bankInfo: {
        bankName: bankInfo.bankName || 'Chưa cập nhật',
        accountNumber: bankInfo.accountNumber || 'Chưa cập nhật',
        accountHolder: bankInfo.accountHolder || 'Chưa cập nhật',
        qrImageUrl: bankInfo.qrImageUrl,
      },
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
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
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
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Không có dữ liệu học sinh hoặc điểm danh trong tháng này.
                  </td>
                </tr>
              ) : (
                students.map(s => {
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
                })
              )}
            </tbody>
          </table>
        </div>

        <Dialog open={!!selectedStudentId} onOpenChange={o => !o && setSelectedStudentId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Xuất phiếu học phí</DialogTitle></DialogHeader>

            <div className="space-y-6">
              {/* Learning roadmap section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Lộ trình học tập</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentLearning">Nội dung đang học</Label>
                    <Textarea
                      id="currentLearning"
                      placeholder="Ví dụ: Phương trình bậc 2, hệ phương trình..."
                      value={currentLearning}
                      onChange={e => setCurrentLearning(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="upcomingPlan">Kế hoạch tiếp theo</Label>
                    <Textarea
                      id="upcomingPlan"
                      placeholder="Ví dụ: Ôn tập kiểm tra giữa kỳ, bất phương trình..."
                      value={upcomingPlan}
                      onChange={e => setUpcomingPlan(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Teacher review section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Nhận xét của gia sư</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="positiveReview">Mặt tích cực</Label>
                    <Textarea
                      id="positiveReview"
                      placeholder="Ví dụ: Chăm chỉ, tiếp thu nhanh..."
                      value={positiveReview}
                      onChange={e => setPositiveReview(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="improvementReview">Điểm cần rèn luyện</Label>
                    <Textarea
                      id="improvementReview"
                      placeholder="Ví dụ: Cần cẩn thận hơn khi tính toán..."
                      value={improvementReview}
                      onChange={e => setImprovementReview(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Fee adjustment */}
              <FeeAdjustment
                subtotal={selectedStudentId ? calculateForStudent(selectedStudentId).subtotal : 0}
                onChange={(a, n) => { setAdjAmount(a); if(n) setAdjNote(n); }}
              />
            </div>

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