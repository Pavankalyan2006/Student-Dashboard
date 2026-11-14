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

const COLLAPSE_KEY = 'btech.sidebarCollapsed';

function readCollapsed(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0');
  } catch {
    /* storage unavailable: the choice lasts for this session only */
  }
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: readCollapsed(),
  mobileDrawerOpen: false,
  globalSearchOpen: false,
  searchInitialQuery: '',
  aiPanelOpen: false,
  activeWorkspaceTab: 'overview',
  aiInitialPrompt: '',

  toggleSidebar: () =>
    set((state) => {
      writeCollapsed(!state.sidebarCollapsed);
      return { sidebarCollapsed: !state.sidebarCollapsed };
    }),
  setSidebarCollapsed: (collapsed) => {
    writeCollapsed(collapsed);
    set({ sidebarCollapsed: collapsed });
  },
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
  setGlobalSearchOpen: (open, initialQuery = '') =>
    set({ globalSearchOpen: open, searchInitialQuery: initialQuery }),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
  setActiveWorkspaceTab: (tab) => set({ activeWorkspaceTab: tab }),
  setAiInitialPrompt: (prompt) => set({ aiInitialPrompt: prompt }),
}));

