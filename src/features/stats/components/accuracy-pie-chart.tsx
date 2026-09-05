'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AccuracyPieChartProps { correct: number; wrong: number; accuracy: number; }
export function AccuracyPieChart({ correct, wrong, accuracy }: AccuracyPieChartProps) {
  const data = [
    { name: 'Đúng', value: correct, color: 'rgb(var(--color-success))' },
    { name: 'Sai', value: wrong, color: 'rgb(var(--color-danger))' },
  ];
  return (
    <div role="img" aria-label={`Chính xác ${accuracy} phần trăm. ${correct} câu đúng, ${wrong} câu sai.`}>
      <div className="relative h-[180px] w-full">
        {correct + wrong === 0 ? <div className="absolute left-1/2 top-1/2 h-[136px] w-[136px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[10px] border-track" /> :
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none" isAnimationActive={false}>
              {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value} câu`, '']} contentStyle={{ background: 'rgb(var(--color-surface-elevated))', color: 'rgb(var(--color-text-primary))', borderRadius: 'var(--radius-md)', border: '1px solid rgb(var(--color-border))', boxShadow: 'var(--shadow-float)' }} itemStyle={{ color: 'rgb(var(--color-text-primary))' }} />
          </PieChart>
        </ResponsiveContainer>}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="vivux-stat-number text-3xl">{accuracy}%</span><span className="mt-1 text-xs text-muted-foreground">chính xác</span></div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Đúng {correct}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" />Sai {wrong}</span>
      </div>
    </div>
  );
}
