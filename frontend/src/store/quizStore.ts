import { create } from 'zustand';
import { IQuiz } from '../types';

interface QuizStore {
  quizzes: IQuiz[];
  currentQuiz: IQuiz | null;
  isLoading: boolean;
  error: string | null;

  setQuizzes: (quizzes: IQuiz[]) => void;
  setCurrentQuiz: (quiz: IQuiz | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  adicionarQuiz: (quiz: IQuiz) => void;
  atualizarQuiz: (id: string, quiz: Partial<IQuiz>) => void;
  removerQuiz: (id: string) => void;
  limparTudo: () => void;
}

const initialState = {
  quizzes: [],
  currentQuiz: null,
  isLoading: false,
  error: null,
};

export const useQuizStore = create<QuizStore>((set) => ({
  ...initialState,

  setQuizzes: (quizzes) => set({ quizzes }),
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  adicionarQuiz: (quiz) =>
    set((state) => ({
      quizzes: [quiz, ...state.quizzes],
    })),

  atualizarQuiz: (id, quizAtualizado) =>
    set((state) => ({
      quizzes: state.quizzes.map((q) =>
        q._id === id ? { ...q, ...quizAtualizado } : q
      ),
      currentQuiz:
        state.currentQuiz?._id === id
          ? { ...state.currentQuiz, ...quizAtualizado }
          : state.currentQuiz,
    })),

  removerQuiz: (id) =>
    set((state) => ({
      quizzes: state.quizzes.filter((q) => q._id !== id),
      currentQuiz: state.currentQuiz?._id === id ? null : state.currentQuiz,
    })),

  limparTudo: () => set(initialState),
}));
