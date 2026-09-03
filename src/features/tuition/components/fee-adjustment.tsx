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