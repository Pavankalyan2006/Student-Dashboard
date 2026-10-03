import { create } from 'zustand';
import { PlacementCategory, MockInterviewType, PlacementDifficulty, MockInterviewMode } from '../types/placement';

interface PlacementUiState {
  // Topic filtering
  selectedCategory: PlacementCategory | 'ALL';
  setSelectedCategory: (cat: PlacementCategory | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Mock interview configuration wizard state
  wizardInterviewType: MockInterviewType;
  setWizardInterviewType: (type: MockInterviewType) => void;
  wizardRoleId: string;
  setWizardRoleId: (roleId: string) => void;
  wizardCompanyId?: string;
  setWizardCompanyId: (companyId?: string) => void;
  wizardProjectId?: string;
  setWizardProjectId: (projectId?: string) => void;
  wizardDifficulty: PlacementDifficulty;
  setWizardDifficulty: (diff: PlacementDifficulty) => void;
  wizardMode: MockInterviewMode;
  setWizardMode: (mode: MockInterviewMode) => void;

  // Active interview interaction state
  currentAnswerDraft: string;
  setCurrentAnswerDraft: (text: string) => void;
  isAiEvaluating: boolean;
  setIsAiEvaluating: (val: boolean) => void;
  showStarModal: boolean;
  setShowStarModal: (open: boolean) => void;
}

export const usePlacementUiStore = create<PlacementUiState>((set) => ({
  selectedCategory: 'ALL',
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  wizardInterviewType: 'TECHNICAL',
  setWizardInterviewType: (wizardInterviewType) => set({ wizardInterviewType }),
  wizardRoleId: 'role_sde',
  setWizardRoleId: (wizardRoleId) => set({ wizardRoleId }),
  wizardCompanyId: undefined,
  setWizardCompanyId: (wizardCompanyId) => set({ wizardCompanyId }),
  wizardProjectId: undefined,
  setWizardProjectId: (wizardProjectId) => set({ wizardProjectId }),
  wizardDifficulty: 'MEDIUM',
  setWizardDifficulty: (wizardDifficulty) => set({ wizardDifficulty }),
  wizardMode: 'SIMULATION',
  setWizardMode: (wizardMode) => set({ wizardMode }),

  currentAnswerDraft: '',
  setCurrentAnswerDraft: (currentAnswerDraft) => set({ currentAnswerDraft }),
  isAiEvaluating: false,
  setIsAiEvaluating: (isAiEvaluating) => set({ isAiEvaluating }),
  showStarModal: false,
  setShowStarModal: (showStarModal) => set({ showStarModal }),
}));
