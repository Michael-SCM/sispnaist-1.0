import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { IEmpresaDados } from '../../types/analytics.js';

interface IBarChartProps {
  dados: IEmpresaDados[];
  titulo?: string;
  altura?: number;
  cor?: string;
  dataKey?: string;
  unidade?: string;
}

export const BarChartComponent: React.FC<IBarChartProps> = ({
  dados,
  titulo = 'Trabalhadores por Empresa',
  altura = 300,
  cor = '#3b82f6',
  dataKey = 'total',
  unidade = 'Trabalhadores',
}) => {
  if (!dados || dados.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Sem dados disponíveis</p>
      </div>
    );
  }

  const LARGURA_POR_BARRA = 70;
  const larguraGrafico = Math.max(dados.length * LARGURA_POR_BARRA + 60, 400);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{titulo}</h3>
      <div style={{ overflowX: 'auto' }}>
        <ResponsiveContainer width={larguraGrafico} height={altura}>
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="nome"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={false}
              allowDecimals={dataKey !== 'total'}
              domain={dataKey !== 'total' ? [0, 100] : undefined}
              tickFormatter={dataKey !== 'total' ? (v: number) => `${v}%` : undefined}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number, name: string, props: any) => {
                const payload = props?.payload;
                if (payload?.percentual && dataKey === 'percentual') {
                  return [`${payload.percentual}% (${payload.total} trabalhadores)`, unidade];
                }
                if (payload?.percentual) {
                  return [`${value} trabalhadores (${payload.percentual}%)`, 'Total'];
                }
                return [`${value} ${unidade.toLowerCase()}`, 'Total'];
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={() => (
                <span className="text-gray-700 text-sm">{unidade}</span>
              )}
            />
            <Bar
              dataKey={dataKey}
              fill={cor}
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
