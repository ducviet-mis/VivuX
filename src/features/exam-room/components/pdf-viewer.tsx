'use client';

import { FileText, ZoomIn, ZoomOut, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';

interface PdfViewerProps {
  pdfUrl: string;
}

export function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveUrl = localPdfUrl || pdfUrl;
  // Valid if it's a base64 data URL, blob URL, or a real http URL
  const isValidUrl = effectiveUrl && effectiveUrl.length > 0 && (
    effectiveUrl.startsWith('data:') || 
    effectiveUrl.startsWith('blob:') || 
    effectiveUrl.startsWith('http')
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setLocalPdfUrl(url);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  return (
    <div className="w-full h-full flex flex-col bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden border">
      <div className="bg-white dark:bg-slate-900 border-b p-2 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 text-sm font-medium">
          <FileText className="w-4 h-4 text-primary" />
          <span>Đề thi.pdf</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs w-12 text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
        
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()} title="Tải PDF lên">
          <Upload className="w-4 h-4" />
        </Button>
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".pdf"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
      
      <div className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-900">
        {isValidUrl ? (
          <iframe 
            src={`${effectiveUrl}#toolbar=0`}
            className="w-full border-0"
            style={{ height: '100%', minHeight: '100%' }}
            title="Đề thi PDF"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Chưa có đề thi</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Bấm nút bên dưới để tải file PDF đề thi lên.
            </p>
            <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="w-4 h-4" />
              Tải đề thi PDF lên
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
