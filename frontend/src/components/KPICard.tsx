import React from 'react';

interface IKPICardProps {
  titulo: string;
  valor: number | string;
  icone?: string;
  cor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
  descricao?: string;
  tendencia?: 'up' | 'down' | 'neutral';
  valorTendencia?: string;
}

const corMap = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  red: 'bg-red-50 border-red-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  purple: 'bg-purple-50 border-purple-200',
  orange: 'bg-orange-50 border-orange-200',
};

const corIconeMap = {
  blue: 'text-blue-600 bg-blue-100',
  green: 'text-green-600 bg-green-100',
  red: 'text-red-600 bg-red-100',
  yellow: 'text-yellow-600 bg-yellow-100',
  purple: 'text-purple-600 bg-purple-100',
  orange: 'text-orange-600 bg-orange-100',
};

export const KPICard: React.FC<IKPICardProps> = ({
  titulo,
  valor,
  icone = '📊',
  cor = 'blue',
  descricao,
  tendencia,
  valorTendencia,
}) => {
  return (
    <div className={`card border ${corMap[cor]} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{titulo}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{valor}</p>
          {descricao && (
            <p className="text-xs text-gray-500 mt-1">{descricao}</p>
          )}
          {tendencia && valorTendencia && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  tendencia === 'up'
                    ? 'text-green-600'
                    : tendencia === 'down'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {tendencia === 'up' ? '↑' : tendencia === 'down' ? '↓' : '→'} {valorTendencia}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${corIconeMap[cor]}`}>
          <span className="text-2xl">{icone}</span>
        </div>
      </div>
    </div>
  );
};
