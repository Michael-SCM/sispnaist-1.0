import { create } from 'zustand';
import { IProgressoTreinamento, ICertificado } from '../types';

interface TreinamentoStore {
  progressos: IProgressoTreinamento[];
  currentProgresso: IProgressoTreinamento | null;
  certificados: ICertificado[];
  currentCertificado: ICertificado | null;
  isLoading: boolean;
  error: string | null;

  setProgressos: (progressos: IProgressoTreinamento[]) => void;
  setCurrentProgresso: (progresso: IProgressoTreinamento | null) => void;
  setCertificados: (certificados: ICertificado[]) => void;
  setCurrentCertificado: (certificado: ICertificado | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  atualizarProgresso: (videoAulaId: string, data: Partial<IProgressoTreinamento>) => void;
  adicionarCertificado: (certificado: ICertificado) => void;
  limparTudo: () => void;
}

const initialState = {
  progressos: [],
  currentProgresso: null,
  certificados: [],
  currentCertificado: null,
  isLoading: false,
  error: null,
};

export const useTreinamentoStore = create<TreinamentoStore>((set) => ({
  ...initialState,

  setProgressos: (progressos) => set({ progressos }),
  setCurrentProgresso: (progresso) => set({ currentProgresso: progresso }),
  setCertificados: (certificados) => set({ certificados }),
  setCurrentCertificado: (certificado) => set({ currentCertificado: certificado }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  atualizarProgresso: (videoAulaId, data) =>
    set((state) => ({
      progressos: state.progressos.map((p) =>
        p.videoAulaId === videoAulaId ? { ...p, ...data } : p
      ),
      currentProgresso:
        state.currentProgresso?.videoAulaId === videoAulaId
          ? { ...state.currentProgresso, ...data }
          : state.currentProgresso,
    })),

  adicionarCertificado: (certificado) =>
    set((state) => ({
      certificados: [certificado, ...state.certificados],
    })),

  limparTudo: () => set(initialState),
}));
