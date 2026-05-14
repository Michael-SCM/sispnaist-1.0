import { create } from 'zustand';
import { IQuestionario } from '../types';

interface QuestionarioStore {
  questionarios: IQuestionario[];
  currentQuestionario: (IQuestionario & { itens: any[] }) | null;
  total: number;
  page: number;
  limit: number;
  pages: number;
  isLoading: boolean;
  error: string | null;

  setQuestionarios: (questionarios: IQuestionario[]) => void;
  setCurrentQuestionario: (questionario: (IQuestionario & { itens: any[] }) | null) => void;
  setPage: (page: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  adicionarQuestionario: (questionario: IQuestionario) => void;
  atualizarQuestionario: (id: string, questionario: Partial<IQuestionario>) => void;
  removerQuestionario: (id: string) => void;

  setPaginacao: (data: { total: number; pages: number; page: number; limit: number }) => void;
  limparTudo: () => void;
}

const initialState = {
  questionarios: [],
  currentQuestionario: null,
  total: 0,
  page: 1,
  limit: 20,
  pages: 1,
  isLoading: false,
  error: null,
};

export const useQuestionarioStore = create<QuestionarioStore>((set) => ({
  ...initialState,

  setQuestionarios: (questionarios) => set({ questionarios }),
  setCurrentQuestionario: (questionario) => set({ currentQuestionario: questionario }),
  setPage: (page) => set({ page }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  adicionarQuestionario: (questionario) =>
    set((state) => ({
      questionarios: [questionario, ...state.questionarios],
      total: state.total + 1,
    })),

  atualizarQuestionario: (id, questionarioAtualizado) =>
    set((state) => ({
      questionarios: state.questionarios.map((q) =>
        q._id === id ? { ...q, ...questionarioAtualizado } : q
      ),
      currentQuestionario:
        state.currentQuestionario?._id === id
          ? { ...state.currentQuestionario, ...questionarioAtualizado }
          : state.currentQuestionario,
    })),

  removerQuestionario: (id) =>
    set((state) => ({
      questionarios: state.questionarios.filter((q) => q._id !== id),
      total: state.total - 1,
      currentQuestionario: state.currentQuestionario?._id === id ? null : state.currentQuestionario,
    })),

  setPaginacao: (data) =>
    set({
      total: data.total,
      pages: data.pages,
      page: data.page,
      limit: data.limit,
    }),

  limparTudo: () => set(initialState),
}));
