'use client';
import { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface QrCodeUploadProps {
  onUpload: (dataUrl: string | null) => void;
  initialUrl?: string | null;
}

export const QrCodeUpload = ({ onUpload, initialUrl }: QrCodeUploadProps) => {
  const [preview, setPreview] = useState<string | null>(initialUrl || null);

  useEffect(() => {
    if (initialUrl !== undefined) {
      setPreview(initialUrl);
    }
  }, [initialUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
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
    <div className="flex flex-col items-center justify-center min-h-[160px] gap-3 border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/10 hover:bg-muted/20 transition-colors">
      {preview ? (
        <div className="relative group">
          <img src={preview} alt="QR Code" className="w-40 h-40 object-contain bg-white rounded-md shadow-sm p-1" />
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute -top-2 -right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" 
            onClick={() => { setPreview(null); onUpload(null); }}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <div className="p-3 bg-primary/10 rounded-full text-primary"><Upload className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium">Tải lên mã QR thanh toán</p>
            <p className="text-xs text-muted-foreground mt-1">Chỉ chấp nhận file ảnh (PNG, JPG)</p>
          </div>
          <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" id="qr-upload" onChange={handleFileChange} />
          <Button variant="outline" size="sm" asChild className="mt-2">
            <label htmlFor="qr-upload" className="cursor-pointer">Chọn ảnh</label>
          </Button>
        </>
      )}
    </div>
  );
};