import { create } from 'zustand';
import { VisualizationSession, VisualizationStep } from '../types/dsa';

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 1.5 | 2;
export type MobileTab = 'learn' | 'visualize' | 'code' | 'ai';

interface DSAVisualizerState {
  session: VisualizationSession | null;
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  activeMobileTab: MobileTab;
  aiDrawerOpen: boolean;
  comparisonModalOpen: boolean;
  customInputModalOpen: boolean;
  customInput: any;

  // Actions
  setSession: (session: VisualizationSession | null) => void;
  setCurrentStepIndex: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  restart: () => void;
  setIsPlaying: (val: boolean) => void;
  togglePlayPause: () => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
  setActiveMobileTab: (tab: MobileTab) => void;
  setAiDrawerOpen: (open: boolean) => void;
  setComparisonModalOpen: (open: boolean) => void;
  setCustomInputModalOpen: (open: boolean) => void;
  setCustomInput: (input: any) => void;
}

export const useDSAVisualizerStore = create<DSAVisualizerState>((set, get) => ({
  session: null,
  currentStepIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,
  activeMobileTab: 'visualize',
  aiDrawerOpen: false,
  comparisonModalOpen: false,
  customInputModalOpen: false,
  customInput: null,

  setSession: (session) =>
    set({
      session,
      currentStepIndex: 0,
      isPlaying: false,
    }),

  setCurrentStepIndex: (index) => {
    const session = get().session;
    if (!session || !session.steps) return;
    const bounded = Math.max(0, Math.min(index, session.steps.length - 1));
    set({ currentStepIndex: bounded });
  },

  nextStep: () => {
    const { session, currentStepIndex } = get();
    if (!session || !session.steps) return;
    if (currentStepIndex < session.steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  restart: () => {
    set({ currentStepIndex: 0, isPlaying: false });
  },

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  togglePlayPause: () => {
    const { isPlaying, currentStepIndex, session } = get();
    if (!isPlaying && session && currentStepIndex >= session.steps.length - 1) {
      // If at end, restart then play
      set({ currentStepIndex: 0, isPlaying: true });
    } else {
      set({ isPlaying: !isPlaying });
    }
  },

  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setActiveMobileTab: (activeMobileTab) => set({ activeMobileTab }),
  setAiDrawerOpen: (aiDrawerOpen) => set({ aiDrawerOpen }),
  setComparisonModalOpen: (comparisonModalOpen) => set({ comparisonModalOpen }),
  setCustomInputModalOpen: (customInputModalOpen) => set({ customInputModalOpen }),
  setCustomInput: (customInput) => set({ customInput }),
}));
