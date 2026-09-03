'use client';
import { InvoiceData } from '../types';
import { generateInvoiceHTML } from '../utils/invoice-generator';

export const InvoiceTemplate = ({ data }: { data: InvoiceData }) => {
  return (
    <div className="w-full h-full bg-white text-black p-4 rounded-md overflow-auto shadow-inner"
         dangerouslySetInnerHTML={{ __html: generateInvoiceHTML(data) }} />
  );
};