import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimeFilter } from '../types';

interface TimeFilterTabsProps {
  value: TimeFilter;
  onChange: (value: TimeFilter) => void;
}

export function TimeFilterTabs({ value, onChange }: TimeFilterTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as TimeFilter)} className="w-full sm:w-auto">
      <TabsList className="grid w-full grid-cols-4 sm:flex h-9 p-1">
        <TabsTrigger value="today" className="text-xs sm:text-sm">Hôm nay</TabsTrigger>
        <TabsTrigger value="week" className="text-xs sm:text-sm">Tuần này</TabsTrigger>
        <TabsTrigger value="month" className="text-xs sm:text-sm">Tháng này</TabsTrigger>
        <TabsTrigger value="all" className="text-xs sm:text-sm">Tất cả</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
