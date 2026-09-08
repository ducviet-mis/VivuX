import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gói tài khoản FlyDo — FlyGo, FlyMax và FlyInfinity',
  description: 'So sánh các gói FlyGo miễn phí, FlyMax theo tháng hoặc năm và FlyInfinity trọn đời.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
