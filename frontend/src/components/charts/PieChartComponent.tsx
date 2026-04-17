import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IGraficoDados } from '../../types/analytics.js';

interface IPieChartProps {
  dados: IGraficoDados[];
  titulo?: string;
  altura?: number;
  cores?: string[];
}

const CORES = [
  '#3b82f6', // blue
  '#10b981', // green
  '#ef4444', // red
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export const PieChartComponent: React.FC<IPieChartProps> = ({
  dados,
  titulo = 'Distribuição',
  altura = 300,
  cores = CORES,
}) => {
  if (!dados || dados.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Sem dados disponíveis</p>
      </div>
    );
  }

  const total = dados.reduce((acc, item) => acc + item.valor, 0);

  // Transformar dados para formato correto do Recharts
  const chartData = dados.map((item, index) => ({
    name: item.nome,
    value: item.valor,
    color: cores[index % cores.length],
  }));

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{titulo}</h3>
      <ResponsiveContainer width="100%" height={altura}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, value, cx: pieCx, cy: pieCy, midAngle, innerRadius, outerRadius: pieOuterRadius }) => {
              const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
              
              // Abreviar nomes muito longos
              const shortName = name.length > 20 ? name.substring(0, 18) + '...' : name;
              
              return `${shortName} (${percent}%)`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number, name: string) => {
              const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return [`${value} (${percent}%)`, name];
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-gray-700 text-sm">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
