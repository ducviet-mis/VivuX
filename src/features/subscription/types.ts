export type AccountTier = 'flygo' | 'flymax' | 'flyinfinity';

export type PaidPlanCode = 'flymax_monthly' | 'flymax_yearly' | 'flyinfinity';

export interface PaidPlan {
  code: PaidPlanCode;
  name: string;
  billingLabel: string;
  price: number;
  durationDays: number | null;
}

export interface PaymentSettings {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrImageUrl: string;
}
