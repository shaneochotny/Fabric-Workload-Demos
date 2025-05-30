export interface IRetailStores {
  outletName: string | null;
  storeName: string | null;
};

export interface IRetailCategories {
  category: string | null;
};

export interface IRetailProducts {
  productName: string | null;
};

export interface IRetailRevenueStats {
  revenue: number;
  profit: number;
  unitsSold: number;
  inventoryOnHand: number;
};

export interface IRetailSalesSummary {
  name: string;
  storeLocation: string | null;
  revenue: number;
  profit: number;
  unitsSold: number;
  inventoryOnHand: number;
  margin: number;
};

export interface IRetailSalesDetails {
  outletName: string;
  storeName: string;
  productName: string;
  sku: string;
  category: string;
  revenue: number;
  profit: number;
  unitsSold: number;
  inventoryOnHand: number;
  margin: number;
};