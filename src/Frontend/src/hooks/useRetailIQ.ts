import { create } from 'zustand';
export { useShallow } from 'zustand/react/shallow';

type State = {
  graphType: string;
  showBy: string;
  pivotBy: string;
  storeFilter: string;
  categoryFilter: string;
  productFilter: string;
}

type Action = {
  setGraphType: (graphType: State['graphType']) => void;
  setShowBy: (showBy: State['showBy']) => void;
  setPivotBy: (pivotBy: State['pivotBy']) => void;
  setStoreFilter: (storeFilter: State['storeFilter']) => void;
  setCategoryFilter: (categoryFilter: State['categoryFilter']) => void;
  setProductFilter: (productFilter: State['productFilter']) => void;
}

export const useUIStore = create<State & Action>()((set) => ({
  graphType: 'Heatmap',
  setGraphType: (value: any) => {
    set({ graphType: value });
  },

  showBy: 'StoreName',
  setShowBy: (value: any) => {
    set({ showBy: value });
  },

  pivotBy: 'last7DaysSales',
  setPivotBy: (value: any) => {
    set({ pivotBy: value });
  },

  storeFilter: 'All Stores',
  setStoreFilter: (value: any) => {
    set({ storeFilter: value });
  },

  categoryFilter: 'All Categories',
  setCategoryFilter: (value: any) => {
    set({ categoryFilter: value });
  },

  productFilter: 'All Products',
  setProductFilter: (value: any) => {
    set({ productFilter: value });
  },
}));