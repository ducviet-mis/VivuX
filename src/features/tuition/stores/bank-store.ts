import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrImageUrl: string | null;
}

interface BankState {
  bankInfo: BankInfo;
  setBankInfo: (info: Partial<BankInfo>) => void;
  setQrImage: (url: string | null) => void;
}

export const useBankStore = create<BankState>()(
  persist(
    (set) => ({
      bankInfo: {
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        qrImageUrl: null,
      },
      setBankInfo: (info) => set((state) => ({
        bankInfo: { ...state.bankInfo, ...info }
      })),
      setQrImage: (url) => set((state) => ({
        bankInfo: { ...state.bankInfo, qrImageUrl: url }
      })),
    }),
    { name: 'edu-tutor-bank' }
  )
);
