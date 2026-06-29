import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  AlertTriangle,
  HeartPulse,
  Syringe,
  Activity,
  TrendingUp,
  BarChart3,
  Download,
} from 'lucide-react';
import { publicReportService, IRelatorioConformidade } from '../../services/publicReportService';
import { KPICard } from '../../components/KPICard';

const CORES_GRAFICO = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

const BarChartSimple: React.FC<{
  dados: { nome: string; valor: number }[];
  titulo: string;
  cor?: string;
}> = ({ dados, titulo, cor = '#3b82f6' }) => {
  if (!dados || dados.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-sm">Sem dados disponíveis</p>
      </div>
    );
  }

  const maxValor = Math.max(...dados.map((d) => d.valor), 1);

  if (maxValor === 0) {
    return (
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">{titulo}</h3>
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
          <p className="text-gray-400 text-sm">Nenhum registro encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">{titulo}</h3>
      <div className="space-y-3">
        {dados.map((item, i) => {
          const widthPercent = (item.valor / maxValor) * 100;
          return (
            <div key={i}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span className="truncate max-w-[70%]">{item.nome}</span>
                <span className="font-semibold">{item.valor}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(widthPercent, 2)}%`,
                    backgroundColor: cor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PieChartSimple: React.FC<{
  dados: { nome: string; valor: number }[];
  titulo: string;
}> = ({ dados, titulo }) => {
  if (!dados || dados.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-sm">Sem dados disponíveis</p>
      </div>
    );
  }

  const total = dados.reduce((acc, item) => acc + (item.valor > 0 ? item.valor : 0), 0);

  if (total === 0) {
    return (
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">{titulo}</h3>
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
          <p className="text-gray-400 text-sm">Nenhum registro encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">{titulo}</h3>
      <div className="flex flex-col gap-2">
        {dados.map((item, i) => {
          const percent = total > 0 ? ((item.valor / total) * 100).toFixed(1) : 0;
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: CORES_GRAFICO[i % CORES_GRAFICO.length] }}
              />
              <span className="text-gray-700 flex-1 truncate">{item.nome}</span>
              <span className="font-semibold text-gray-900">
                {item.valor} ({percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LineChartSimple: React.FC<{
  dados: { mes: string; quantidade: number }[];
  titulo: string;
}> = ({ dados, titulo }) => {
  if (!dados || dados.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-sm">Sem dados disponíveis</p>
      </div>
    );
  }

  const maxValor = Math.max(...dados.map((d) => d.quantidade), 1);

  if (maxValor === 0) {
    return (
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">{titulo}</h3>
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
          <p className="text-gray-400 text-sm">Nenhum acidente registrado no período</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">{titulo}</h3>
      <div className="flex items-end gap-2 h-32">
        {dados.map((item, i) => {
          const heightPercent = (item.quantidade / maxValor) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-gray-600">{item.quantidade}</span>
              <div
                className="w-full rounded-t transition-all duration-500"
                style={{
                  height: `${Math.max(heightPercent, 2)}%`,
                  backgroundColor: '#3b82f6',
                }}
              />
              <span className="text-[10px] text-gray-500 whitespace-nowrap">{item.mes}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const RelatorioConformidade: React.FC = () => {
  const [data, setData] = useState<IRelatorioConformidade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        const relatorio = await publicReportService.obterRelatorio();
        setData(relatorio);
      } catch {
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
            <Shield className="text-blue-600" size={28} />
            <h1 className="text-xl font-bold text-gray-800">SISPNAIST</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
            <Shield className="text-blue-600" size={28} />
            <h1 className="text-xl font-bold text-gray-800">SISPNAIST</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-3" size={40} />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-600" size={28} />
            <div>
              <h1 className="text-xl font-bold text-gray-800">SISPNAIST</h1>
              <p className="text-xs text-gray-500">Relatório de Conformidade e Transparência</p>
            </div>
          </div>
          <span className="text-xs text-gray-400">
            Dados de {new Date(data.dataReferencia).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-2">Relatório de Transparência</h2>
          <p className="text-blue-100 text-sm max-w-2xl">
            Dados anonimizados e agregados do sistema SISPNAIST. Nenhuma informação pessoal
            identificável (PII) é exposta. Este relatório atende aos requisitos de anonimização
            para dados públicos conforme a LGPD e o PNAIST.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard titulo="Trabalhadores Ativos" valor={data.kpis.totalTrabalhadores} icone="👥" cor="blue" descricao="Vínculo ativo" />
          <KPICard titulo="Acidentes" valor={data.kpis.totalAcidentes} icone="⚠️" cor="red" descricao={`${data.kpis.acidentesAbertos} abertos`} />
          <KPICard titulo="Taxa de Resolução" valor={`${data.kpis.taxaResolucao}%`} icone="📈" cor="green" descricao="Acidentes fechados" />
          <KPICard titulo="Doenças Ocupacionais" valor={data.kpis.totalDoencas} icone="🏥" cor="purple" descricao={`${data.kpis.doencasAtivas} ativas`} />
          <KPICard titulo="Cobertura Vacinal" valor={`${data.kpis.coberturaVacinal}%`} icone="💉" cor="orange" descricao={`${data.kpis.totalVacinacoes} registros`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChartSimple dados={data.acidentes.porTipo} titulo="Acidentes por Tipo" />
          <PieChartSimple dados={data.acidentes.porStatus} titulo="Acidentes por Status" />
        </div>

        <LineChartSimple dados={data.acidentes.ultimosMeses} titulo="Acidentes nos Últimos 6 Meses" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartSimple dados={data.acidentes.porEmpresa} titulo="Acidentes por Empresa" cor="#ef4444" />
          <BarChartSimple dados={data.doencas.maisFrequentes} titulo="Doenças mais Frequentes" cor="#8b5cf6" />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Shield className="text-blue-600 mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-blue-800 mb-1">Privacidade e Proteção de Dados</h3>
              <p className="text-sm text-blue-700">
                Este relatório exibe apenas dados agregados e estatísticos. Nenhuma informação
                pessoal identificável (nome, CPF, email, endereço, telefone) é exposta.
                Valores inferiores a 3 são omitidos para evitar re-identificação, conforme
                as boas práticas de anonimização da LGPD.
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
          <p>SISPNAIST - Sistema de Gerenciamento de Segurança e Saúde do Trabalhador</p>
          <p className="mt-1">Dados atualizados em {new Date(data.dataReferencia).toLocaleString('pt-BR')}</p>
        </footer>
      </main>
    </div>
  );
};

export default RelatorioConformidade;
