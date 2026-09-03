'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard, Save, Edit, CheckCircle2 } from "lucide-react";
import { QrCodeUpload } from "./qr-code-upload";
import { useState, useEffect } from "react";
import { useBankStore } from "../stores/bank-store";

export const BankInfoForm = () => {
  const { bankInfo, setBankInfo, setQrImage } = useBankStore();
  const [isSaved, setIsSaved] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const [localInfo, setLocalInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  });

  useEffect(() => {
    setIsClient(true);
    setLocalInfo({
      bankName: bankInfo.bankName,
      accountNumber: bankInfo.accountNumber,
      accountHolder: bankInfo.accountHolder,
    });
    // Assume it's saved if there's an account number
    if (bankInfo.accountNumber) {
      setIsSaved(true);
    }
  }, [bankInfo]);

  const handleSave = () => {
    setBankInfo(localInfo);
    setIsSaved(true);
  };

  if (!isClient) return null;

  return (
    <Card className="rounded-2xl shadow-sm border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="w-5 h-5 text-primary" /> Thông tin thanh toán (Bank)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {isSaved ? (
              <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Đã lưu thông tin</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsSaved(false)}>
                    <Edit className="w-4 h-4 mr-2" /> Sửa
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Ngân hàng:</span>
                    <span className="col-span-2 font-medium">{bankInfo.bankName}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Số TK:</span>
                    <span className="col-span-2 font-medium">{bankInfo.accountNumber}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">Chủ TK:</span>
                    <span className="col-span-2 font-medium">{bankInfo.accountHolder}</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label>Tên ngân hàng</Label>
                  <Input 
                    placeholder="VD: Vietcombank" 
                    value={localInfo.bankName}
                    onChange={(e) => setLocalInfo({ ...localInfo, bankName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Số tài khoản</Label>
                  <Input 
                    placeholder="VD: 0123456789" 
                    value={localInfo.accountNumber}
                    onChange={(e) => setLocalInfo({ ...localInfo, accountNumber: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Tên chủ tài khoản</Label>
                  <Input 
                    placeholder="VD: NGUYEN VAN A" 
                    value={localInfo.accountHolder}
                    onChange={(e) => setLocalInfo({ ...localInfo, accountHolder: e.target.value })}
                  />
                </div>
                <Button className="w-full mt-2" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" /> Lưu thông tin
                </Button>
              </>
            )}
          </div>
          <div>
            <Label className="block mb-2">Mã QR Thanh toán</Label>
            <QrCodeUpload 
              initialUrl={bankInfo.qrImageUrl}
              onUpload={setQrImage} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};