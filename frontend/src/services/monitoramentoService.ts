import api from './api';

export interface AlertaCritico {
  trabalhador: string;
  motivo: string;
  nivel: 'baixo' | 'medio' | 'alto';
}

export interface MonitoramentoData {
  coberturaVacinal: {
    total: number;
    porEmpresa: { nome: string; cobertura: number }[];
  };
  absenteismo: {
    totalDias: number;
    porMes: { mes: string; dias: number }[];
  };
  alertasCriticos: AlertaCritico[];
}

const monitoramentoService = {
  obterDados: async (): Promise<MonitoramentoData> => {
    const response = await api.get('/analytics/monitoramento');
    return response.data.data.monitoramento;
  }
};

export default monitoramentoService;
