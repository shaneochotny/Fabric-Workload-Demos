/**
 * Client Portfolio Activity Interface
 */
export interface IActivity {
  date: string;
  company: string;
  symbol: string;
  sector: string;
  transaction_type: string;
  term: string;
  quantity: number;
  buy_price: number;
  sell_price: number;
  current_price: number;
  total_basis: number;
  current_value: number;
  percent_change: number;
  earnings: number;
  amount: number;
};

/**
 * Client Details Interface
 */
export interface IClientDetails {
  client_id: number;
  name: string;
  tax_bracket_rate: number;
  city: string;
  state: string;
  occupation: string;
  employer: string;
  client_since: Date;
};

/**
 * Client Portfolio Holdings Interface
 */
export interface IHoldingsByType {
  name: string;
  symbol: string;
  sector: string;
  current_quantity: number;
  buys_purchase_cost: number;
  sells_proceeds: number;
  current_price: number;
  previous_close: number;
  todays_percent_change: number;
  current_value: number;
  growth_value: number;
  growth_percent: number;
  percent_of_portfolio: number;
  todays_open_value: number;
  todays_growth_percent: number;
};

/**
 * Client Portfolio Value Interface
 */
export interface IPortfolioValue {
  current_value: number;
};