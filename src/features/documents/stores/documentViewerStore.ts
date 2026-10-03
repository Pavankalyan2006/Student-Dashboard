import { create } from 'zustand';

export interface DocumentViewerState {
  currentPage: number;
  totalPages: number;
  zoom: number;
  fitMode: 'custom' | 'width' | 'page';
  selectedPages: number[];
  selectedText: string;
  searchQuery: string;
  sidebarTab: 'pages' | 'search' | 'info';
  rightPanel: 'chat' | 'summary' | 'notes';
  isMobileSidebarOpen: boolean;

  // Actions
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setFitMode: (mode: 'custom' | 'width' | 'page') => void;
  togglePageSelection: (page: number) => void;
  clearSelectedPages: () => void;
  setSelectedPages: (pages: number[]) => void;
  setSelectedText: (text: string) => void;
  setSearchQuery: (query: string) => void;
  setSidebarTab: (tab: 'pages' | 'search' | 'info') => void;
  setRightPanel: (panel: 'chat' | 'summary' | 'notes') => void;
  toggleMobileSidebar: () => void;
  reset: () => void;
}

export const useDocumentViewerStore = create<DocumentViewerState>((set) => ({
  currentPage: 1,
  totalPages: 1,
  zoom: 100,
  fitMode: 'custom',
  selectedPages: [],
  selectedText: '',
  searchQuery: '',
  sidebarTab: 'pages',
  rightPanel: 'chat',
  isMobileSidebarOpen: false,

  setCurrentPage: (page) =>
    set((state) => ({
      currentPage: Math.max(1, Math.min(page, state.totalPages || 1)),
    })),

  setTotalPages: (total) => set({ totalPages: Math.max(1, total) }),

  setZoom: (zoom) => set({ zoom: Math.max(50, Math.min(200, zoom)), fitMode: 'custom' }),

  zoomIn: () =>
    set((state) => ({
      zoom: Math.min(200, state.zoom + 15),
      fitMode: 'custom',
    })),

  zoomOut: () =>
    set((state) => ({
      zoom: Math.max(50, state.zoom - 15),
      fitMode: 'custom',
    })),

  setFitMode: (fitMode) =>
    set((state) => {
      let zoom = state.zoom;
      if (fitMode === 'width') zoom = 120;
      if (fitMode === 'page') zoom = 90;
      return { fitMode, zoom };
    }),

  togglePageSelection: (page) =>
    set((state) => {
      const exists = state.selectedPages.includes(page);
      return {
        selectedPages: exists
          ? state.selectedPages.filter((p) => p !== page)
          : [...state.selectedPages, page].sort((a, b) => a - b),
      };
    }),

  clearSelectedPages: () => set({ selectedPages: [] }),

  setSelectedPages: (selectedPages) => set({ selectedPages }),

  setSelectedText: (selectedText) => set({ selectedText }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSidebarTab: (sidebarTab) => set({ sidebarTab }),

  setRightPanel: (rightPanel) => set({ rightPanel }),

  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),

  reset: () =>
    set({
      currentPage: 1,
      zoom: 100,
      fitMode: 'custom',
      selectedPages: [],
      selectedText: '',
      searchQuery: '',
      sidebarTab: 'pages',
      rightPanel: 'chat',
      isMobileSidebarOpen: false,
    }),
}));
