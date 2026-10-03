import { create } from 'zustand';
import { AIContextItem } from '../types';

interface ContextState {
  selectedContexts: AIContextItem[];
  isSelectorOpen: boolean;
  addContext: (item: AIContextItem) => void;
  removeContext: (id: string) => void;
  clearContexts: () => void;
  setSelectorOpen: (open: boolean) => void;
}

export const useContextStore = create<ContextState>((set) => ({
  selectedContexts: [
    {
      id: 'ctx_init_paper',
      type: 'RESEARCH_PAPER',
      reference_id: 'paper_seed_1',
      title: 'Attention Is All You Need',
      subtitle: 'NeurIPS 2017 · Transformer Architecture',
    },
  ],
  isSelectorOpen: false,
  addContext: (item) =>
    set((state) => {
      // Prevent duplicates
      if (state.selectedContexts.some((c) => c.reference_id === item.reference_id && c.type === item.type)) {
        return state;
      }
      return { selectedContexts: [...state.selectedContexts, item] };
    }),
  removeContext: (id) =>
    set((state) => ({
      selectedContexts: state.selectedContexts.filter((c) => c.id !== id),
    })),
  clearContexts: () => set({ selectedContexts: [] }),
  setSelectorOpen: (open) => set({ isSelectorOpen: open }),
}));
