export interface ICIPClientDetails {
  client_id: number;
  name: string;
  city: string;
  state: string;
  occupation: string;
  employer: string;
  client_since: Date;
};

export interface IPortfolioStats {
  investments: number;
  commitment: number;
  contributions: number;
  distributions: number;
};

export interface IActiveInvestments {
  investment_name: string;
  commitment: number;
  contributions: number;
  distributions: number;
  start_date: Date;
};

export interface IInvestmentActivity {
  transaction_date: string;
  investment_name: string;
  type: string;
  description: string;
  amount: number;
};