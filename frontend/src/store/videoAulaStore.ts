import { create } from 'zustand';
import { IVideoAula } from '../types/index.js';

interface VideoAulaStore {
  videoAulas: IVideoAula[];
  currentVideoAula: IVideoAula | null;
  total: number;
  page: number;
  limit: number;
  pages: number;
  isLoading: boolean;
  error: string | null;

  setVideoAulas: (videoAulas: IVideoAula[]) => void;
  setCurrentVideoAula: (videoAula: IVideoAula | null) => void;
  setPage: (page: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  adicionarVideoAula: (videoAula: IVideoAula) => void;
  atualizarVideoAula: (id: string, videoAula: Partial<IVideoAula>) => void;
  removerVideoAula: (id: string) => void;

  setPaginacao: (data: { total: number; pages: number; page: number; limit: number }) => void;
  limparTudo: () => void;
}

const initialState = {
  videoAulas: [],
  currentVideoAula: null,
  total: 0,
  page: 1,
  limit: 20,
  pages: 1,
  isLoading: false,
  error: null,
};

export const useVideoAulaStore = create<VideoAulaStore>((set) => ({
  ...initialState,

  setVideoAulas: (videoAulas) => set({ videoAulas }),
  setCurrentVideoAula: (videoAula) => set({ currentVideoAula: videoAula }),
  setPage: (page) => set({ page }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  adicionarVideoAula: (videoAula) =>
    set((state) => ({
      videoAulas: [videoAula, ...state.videoAulas],
      total: state.total + 1,
    })),

  atualizarVideoAula: (id, videoAulaAtualizada) =>
    set((state) => ({
      videoAulas: state.videoAulas.map((v) =>
        v._id === id ? { ...v, ...videoAulaAtualizada } : v
      ),
      currentVideoAula:
        state.currentVideoAula?._id === id
          ? { ...state.currentVideoAula, ...videoAulaAtualizada }
          : state.currentVideoAula,
    })),

  removerVideoAula: (id) =>
    set((state) => ({
      videoAulas: state.videoAulas.filter((v) => v._id !== id),
      total: state.total - 1,
      currentVideoAula: state.currentVideoAula?._id === id ? null : state.currentVideoAula,
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
