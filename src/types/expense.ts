export interface Expense {
  id: string;
  sn: number;
  date: string;
  vendor: string;
  product: string;
  unit: string;
  rate: number;
  quantity: number;
  total: number;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}
