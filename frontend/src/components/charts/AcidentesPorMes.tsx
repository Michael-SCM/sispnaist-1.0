import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { IMensalDados } from '../types/analytics';

interface IAcidentesPorMesProps {
  dados: IMensalDados[];
  altura?: number;
  cor?: string;
  titulo?: string;
}

export const AcidentesPorMes: React.FC<IAcidentesPorMesProps> = ({
  dados,
  altura = 300,
  cor = '#3b82f6',
  titulo = 'Acidentes por Mês',
}) => {
  if (!dados || dados.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Sem dados disponíveis</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{titulo}</h3>
      <ResponsiveContainer width="100%" height={altura}>
        <LineChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="mes"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Line
            type="monotone"
            dataKey="quantidade"
            stroke={cor}
            strokeWidth={3}
            dot={{ fill: cor, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: cor, strokeWidth: 2 }}
            name="Acidentes"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
