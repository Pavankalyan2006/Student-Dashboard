import { create } from 'zustand';

export type ProjectWorkspaceTab =
  | 'overview'
  | 'plan'
  | 'architecture'
  | 'tasks'
  | 'technical'
  | 'documentation'
  | 'testing'
  | 'ai'
  | 'settings';

interface ProjectUiState {
  activeTab: ProjectWorkspaceTab;
  setActiveTab: (tab: ProjectWorkspaceTab) => void;

  // Wizard state
  wizardStep: number;
  setWizardStep: (step: number) => void;
  wizardData: {
    project_type: string;
    domain: string;
    title: string;
    description: string;
    problem_statement: string;
    objectives: string[];
    target_users: string;
    expected_outcome: string;
    technologies: { category: any; technology: string; reason?: string }[];
  };
  setWizardData: (data: Partial<ProjectUiState['wizardData']>) => void;
  resetWizard: () => void;

  // Canvas selection & zoom
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  canvasScale: number;
  setCanvasScale: (scale: number) => void;

  // Documentation editor state
  selectedDocumentId: string | null;
  setSelectedDocumentId: (id: string | null) => void;
}

const initialWizardData = {
  project_type: 'MAJOR_PROJECT',
  domain: 'AI/ML',
  title: '',
  description: '',
  problem_statement: '',
  objectives: [''],
  target_users: 'Students, engineers, and researchers',
  expected_outcome: '',
  technologies: [],
};

export const useProjectUiStore = create<ProjectUiState>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),

  wizardStep: 1,
  setWizardStep: (step) => set({ wizardStep: step }),
  wizardData: initialWizardData,
  setWizardData: (data) =>
    set((state) => ({ wizardData: { ...state.wizardData, ...data } })),
  resetWizard: () => set({ wizardStep: 1, wizardData: initialWizardData }),

  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  canvasScale: 1,
  setCanvasScale: (scale) => set({ canvasScale: scale }),

  selectedDocumentId: null,
  setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),
}));
