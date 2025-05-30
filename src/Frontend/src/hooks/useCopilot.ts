import { create } from 'zustand';
import { ICopilotMessage, ICopilotActivity } from 'interfaces';

interface CopilotState {
  isConnected: boolean
  setIsConnected: (value: boolean) => void

  connectionStatus: string | null
  setConnectionStatus: (value: string) => void

  isThinking: boolean
  setIsThinking: (value: boolean) => void

  chatResponses: ICopilotMessage[]
  addChatResponses: (value: ICopilotMessage) => void
  clearChatResponses: () => void
  
  copilotActivities: ICopilotActivity[]
  addCopilotActivities: (value: ICopilotActivity) => void
  clearCopilotActivities: () => void

  errorMessage: string | null
  setErrorMessage: (value: string) => void
}

export const useCopilot = create<CopilotState>()((set) => ({
  isConnected: false,
  setIsConnected: (value) => set(() => ({ isConnected: value })),

  connectionStatus: null,
  setConnectionStatus: (value) => set(() => ({ connectionStatus: value })),

  isThinking: false,
  setIsThinking: (value) => set(() => ({ isThinking: value })),

  chatResponses: [],
  addChatResponses: (value) => set((state) => ({ chatResponses: [...state.chatResponses, value] })),
  clearChatResponses: () => set(() => ({ chatResponses: [], copilotActivities: [] })),

  copilotActivities: [],
  addCopilotActivities: (value) => set((state) => ({ copilotActivities: [...state.copilotActivities, value] })),
  clearCopilotActivities: () => set(() => ({ copilotActivities: [] })),

  errorMessage: null,
  setErrorMessage: (value) => set(() => ({ errorMessage: value })),
}));
