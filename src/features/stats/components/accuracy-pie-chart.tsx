'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AccuracyPieChartProps {
  correct: number;
  wrong: number;
  accuracy: number;
}

export function AccuracyPieChart({ correct, wrong, accuracy }: AccuracyPieChartProps) {
  const data = [
    { name: 'Đúng', value: correct, color: '#10b981' }, // emerald-500
    { name: 'Sai', value: wrong, color: '#ef4444' }, // red-500
  ];

  return (
    <div className="relative w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value} câu`, '']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-foreground">{accuracy}%</span>
        <span className="text-xs text-muted-foreground font-medium">chính xác</span>
      </div>
    </div>
  );
}
