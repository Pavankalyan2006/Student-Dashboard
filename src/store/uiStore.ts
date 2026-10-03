import { create } from 'zustand';

interface UiState {
  sidebarCollapsed: boolean;
  mobileDrawerOpen: boolean;
  globalSearchOpen: boolean;
  searchInitialQuery: string;
  aiPanelOpen: boolean;
  activeWorkspaceTab: string;
  aiInitialPrompt: string;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileDrawerOpen: (open: boolean) => void;
  setGlobalSearchOpen: (open: boolean, initialQuery?: string) => void;
  setAiPanelOpen: (open: boolean) => void;
  setActiveWorkspaceTab: (tab: string) => void;
  setAiInitialPrompt: (prompt: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
  globalSearchOpen: false,
  searchInitialQuery: '',
  aiPanelOpen: false,
  activeWorkspaceTab: 'overview',
  aiInitialPrompt: '',

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
  setGlobalSearchOpen: (open, initialQuery = '') =>
    set({ globalSearchOpen: open, searchInitialQuery: initialQuery }),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
  setActiveWorkspaceTab: (tab) => set({ activeWorkspaceTab: tab }),
  setAiInitialPrompt: (prompt) => set({ aiInitialPrompt: prompt }),
}));

