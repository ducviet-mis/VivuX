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