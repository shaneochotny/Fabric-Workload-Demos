import { create } from 'zustand';
export { useShallow } from 'zustand/react/shallow';

type State = {
  dashboardTimespan: string;
  selectedHolding: string;
}

type Action = {
  setDashboardTimespan: (dashboardTimespan: State['dashboardTimespan']) => void;
  setSelectedHolding: (selectedHolding: State['selectedHolding']) => void;
}

export const useUIStore = create<State & Action>()((set) => ({
  dashboardTimespan: '6M',
  setDashboardTimespan: (value: any) => {
    set({ dashboardTimespan: value });
  },

  selectedHolding: 'Entire Portfolio',
  setSelectedHolding: (value: any) => {
    set({ selectedHolding: value });
  },
}));