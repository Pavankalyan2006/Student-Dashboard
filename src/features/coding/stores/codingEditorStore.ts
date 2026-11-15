import { create } from 'zustand';
import {
  CodingLanguage,
  ExecutionResult,
  EditorSettings,
} from '../types/coding';

const DEFAULT_PYTHON_BOILERPLATE = `# Python 3 Solution
import sys

def solve():
    # Read standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        print("Hello, Coding Lab!")
        return
    print(f"Processed: {input_data}")

if __name__ == "__main__":
    solve()
`;

export interface DiffModalState {
  isOpen: boolean;
  title: string;
  originalCode: string;
  suggestedCode: string;
  rationale?: string;
  changes?: string[];
  onApply?: () => void;
}

interface CodingEditorState {
  language: CodingLanguage;
  sourceCode: string;
  stdin: string;
  activeProblemId: string | null;
  activeSessionId: string | null;
  activeSavedCodeId: string | null;
  executionResult: ExecutionResult | null;
  isExecuting: boolean;
  /** What the browser sandbox is doing, e.g. "Downloading numpy…". Empty for server runs. */
  runNote: string;
  runStatus: 'idle' | 'running' | 'completed' | 'failed';
  outputTab: 'output' | 'errors' | 'input' | 'tests';
  editorSettings: EditorSettings;
  diffModal: DiffModalState;
  aiPanelOpen: boolean;
  aiActiveTab: 'chat' | 'explain' | 'debug' | 'generate' | 'refactor' | 'tests' | 'review';

  // Actions
  setLanguage: (lang: CodingLanguage) => void;
  setSourceCode: (code: string) => void;
  setStdin: (input: string) => void;
  setActiveProblemId: (id: string | null) => void;
  setActiveSessionId: (id: string | null) => void;
  setActiveSavedCodeId: (id: string | null) => void;
  setExecutionResult: (res: ExecutionResult | null) => void;
  setIsExecuting: (val: boolean) => void;
  setRunNote: (text: string) => void;
  setRunStatus: (status: 'idle' | 'running' | 'completed' | 'failed') => void;
  setOutputTab: (tab: 'output' | 'errors' | 'input' | 'tests') => void;
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
  openDiffModal: (params: {
    title: string;
    originalCode: string;
    suggestedCode: string;
    rationale?: string;
    changes?: string[];
    onApply: () => void;
  }) => void;
  closeDiffModal: () => void;
  toggleAiPanel: () => void;
  setAiPanelOpen: (open: boolean) => void;
  setAiActiveTab: (tab: 'chat' | 'explain' | 'debug' | 'generate' | 'refactor' | 'tests' | 'review') => void;
  resetCode: (boilerplate?: string) => void;
}

const getStoredSettings = (): EditorSettings => {
  try {
    const raw = localStorage.getItem('btech_coding_editor_settings');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 4,
    wordWrap: 'on',
    minimap: true,
  };
};

export const useCodingEditorStore = create<CodingEditorState>((set, get) => ({
  language: 'python',
  sourceCode: DEFAULT_PYTHON_BOILERPLATE,
  stdin: '',
  activeProblemId: null,
  activeSessionId: null,
  activeSavedCodeId: null,
  executionResult: null,
  isExecuting: false,
  runNote: '',
  runStatus: 'idle',
  outputTab: 'output',
  editorSettings: getStoredSettings(),
  diffModal: {
    isOpen: false,
    title: '',
    originalCode: '',
    suggestedCode: '',
  },
  aiPanelOpen: true,
  aiActiveTab: 'chat',

  setLanguage: (lang) => set({ language: lang }),
  setSourceCode: (code) => set({ sourceCode: code }),
  setStdin: (input) => set({ stdin: input }),
  setActiveProblemId: (id) => set({ activeProblemId: id }),
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  setActiveSavedCodeId: (id) => set({ activeSavedCodeId: id }),
  setExecutionResult: (res) => {
    let nextTab: 'output' | 'errors' | 'input' | 'tests' = 'output';
    let status: 'completed' | 'failed' = 'completed';

    if (res) {
      if (res.status === 'SUCCESS') {
        status = 'completed';
        nextTab = 'output';
      } else {
        status = 'failed';
        nextTab = 'errors';
      }
    }
    set({
      executionResult: res,
      runStatus: status,
      outputTab: nextTab,
    });
  },
  setRunNote: (text) => set({ runNote: text }),
  setIsExecuting: (val) => set({ isExecuting: val, runStatus: val ? 'running' : get().runStatus }),
  setRunStatus: (status) => set({ runStatus: status }),
  setOutputTab: (tab) => set({ outputTab: tab }),
  updateEditorSettings: (updates) => {
    const newSettings = { ...get().editorSettings, ...updates };
    try {
      localStorage.setItem('btech_coding_editor_settings', JSON.stringify(newSettings));
    } catch {}
    set({ editorSettings: newSettings });
  },
  openDiffModal: (params) => {
    set({
      diffModal: {
        isOpen: true,
        title: params.title,
        originalCode: params.originalCode,
        suggestedCode: params.suggestedCode,
        rationale: params.rationale,
        changes: params.changes,
        onApply: params.onApply,
      },
    });
  },
  closeDiffModal: () => {
    set({
      diffModal: {
        isOpen: false,
        title: '',
        originalCode: '',
        suggestedCode: '',
      },
    });
  },
  toggleAiPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
  setAiActiveTab: (tab) => set({ aiActiveTab: tab, aiPanelOpen: true }),
  resetCode: (boilerplate) => set({ sourceCode: boilerplate || DEFAULT_PYTHON_BOILERPLATE }),
}));
