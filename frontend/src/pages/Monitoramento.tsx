import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar,
  TrendingDown,
  UserX,
  ChevronRight,
  Download
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import monitoramentoService, { MonitoramentoData } from '../services/monitoramentoService';
import { KPICard } from '../components/KPICard';
import { BarChartComponent } from '../components/charts';

const Monitoramento: React.FC = () => {
  const [data, setData] = useState<MonitoramentoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const res = await monitoramentoService.obterDados();
      setData(res);
    } catch (error) {
      console.error('Erro ao carregar monitoramento', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Activity className="text-indigo-600" size={32} />
              Monitoramento Clínico Avançado
            </h1>
            <p className="text-slate-500 mt-1">Inteligência em saúde e vigilância ocupacional proativa.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} />
            Exportar Relatório
          </button>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100 font-medium">Cobertura Vacinal</p>
                <h3 className="text-4xl font-black mt-1">{data?.coberturaVacinal.total}%</h3>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <ShieldCheck size={24} />
              </div>
            </div>
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000" 
                style={{ width: `${data?.coberturaVacinal.total}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-medium">Absenteísmo Total</p>
                <h3 className="text-4xl font-black text-slate-900 mt-1">{data?.absenteismo.totalDias}</h3>
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                  <TrendingDown className="text-green-500" size={14} />
                  -4% em relação ao mês anterior
                </p>
              </div>
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                <Calendar size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-medium">Alertas Críticos</p>
                <h3 className="text-4xl font-black text-slate-900 mt-1">{data?.alertasCriticos.length}</h3>
                <p className="text-sm text-amber-500 font-medium mt-1">Ação imediata recomendada</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Absenteísmo Chart */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Tendência de Absenteísmo (Dias)</h3>
            <BarChartComponent 
              dados={data?.absenteismo.porMes || []} 
              titulo=""
              cor="#6366f1"
            />
          </div>

          {/* Alertas Críticos List */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Trabalhadores em Risco</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase">Top Alertas</span>
            </div>
            <div className="space-y-4">
              {data?.alertasCriticos.map((alerta, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      alerta.nivel === 'alto' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      <UserX size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{alerta.trabalhador}</h4>
                      <p className="text-sm text-slate-500">{alerta.motivo}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-500 transition-all" />
                </div>
              ))}
              {(!data?.alertasCriticos || data.alertasCriticos.length === 0) && (
                <div className="text-center py-12 text-slate-400">
                  <p>Nenhum alerta crítico no momento. Bom trabalho!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Monitoramento;
