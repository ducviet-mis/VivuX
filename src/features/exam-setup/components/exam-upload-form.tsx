'use client';

import { useRef, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExamUploadFormProps {
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
}

export function ExamUploadForm({ pdfFile, setPdfFile }: ExamUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {!pdfFile ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-2xl p-12 text-center transition-colors duration-200 cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleChange}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                Kéo thả file PDF hoặc bấm để chọn
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Chỉ hỗ trợ định dạng PDF, dung lượng tối đa 10MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="font-medium text-foreground">{pdfFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setPdfFile(null)}>
            <X className="w-5 h-5 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}
