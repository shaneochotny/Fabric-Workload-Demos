import { create } from 'zustand';
export { useShallow } from 'zustand/react/shallow';

type State = {
  dashboardTimespan: string;
  selectedInvestment: string;
}

type Action = {
  setDashboardTimespan: (dashboardTimespan: State['dashboardTimespan']) => void;
  setSelectedInvestment: (selectedInvestment: State['selectedInvestment']) => void;
}

export const useUIStore = create<State & Action>()((set) => ({
  dashboardTimespan: '1Y',
  setDashboardTimespan: (value: any) => {
    set({ dashboardTimespan: value });
  },

  selectedInvestment: 'Entire Portfolio',
  setSelectedInvestment: (value: any) => {
    set({ selectedInvestment: value });
  },
}));