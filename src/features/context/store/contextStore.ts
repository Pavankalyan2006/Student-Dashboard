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
  // Starts empty: the student picks what the AI may read. (It used to start with a paper the student never saved.)
  selectedContexts: [],
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
