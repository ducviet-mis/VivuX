export type TuitionConfig = { classId: string; feePerSession: number; bankName: string; accountNumber: string; accountHolder: string; qrImageUrl: string | null; };

export type InvoiceData = {
  studentId: string;
  studentName: string;
  month: string;
  sessionsAttended: number;
  sessionDates: string[]; // array of date strings like '2026-08-01'
  feePerSession: number;
  subtotal: number;
  adjustment: number;
  adjustmentNote: string;
  total: number;
  // Teacher review - two separate fields
  positiveReview: string;
  improvementReview: string;
  // Learning roadmap
  currentLearning: string;
  upcomingPlan: string;
  // Bank info
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrImageUrl: string | null;
  };
  generatedAt: string;
};