import { StudyGeometry } from '@/components/shared/study-heading';

export function HandbookCover({ category }: { category: string }) {
  const symbol = category === 'Bản đồ lý thuyết' ? '∑' : category === 'Phương pháp học toán' ? 'ƒ' : 'π';
  return (
    <div aria-hidden="true" className="relative flex h-full min-h-44 w-full items-center justify-center overflow-hidden bg-primary-soft text-primary">
      <StudyGeometry className="!block !right-0 !top-0 !h-full !w-full !opacity-30" />
      <span className="relative font-serif text-8xl italic leading-none opacity-80">{symbol}</span>
      <span className="absolute bottom-4 left-5 text-xs font-semibold tracking-wide">FlyDo · Góc khám phá</span>
    </div>
  );
}
