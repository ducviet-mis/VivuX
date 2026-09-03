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