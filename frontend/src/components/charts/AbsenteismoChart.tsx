import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AbsenteismoData {
  mes: string;
  dias: number;
}

interface AbsenteismoChartProps {
  dados: AbsenteismoData[];
  altura?: number;
  cor?: string;
}

export const AbsenteismoChart: React.FC<AbsenteismoChartProps> = ({
  dados,
  altura = 300,
  cor = '#6366f1',
}) => {
  if (!dados || dados.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-500">Sem dados disponíveis</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={dados} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number) => [`${value} dias`, 'Afastamento']}
        />
        <Bar
          dataKey="dias"
          fill={cor}
          radius={[6, 6, 0, 0]}
          maxBarSize={50}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};