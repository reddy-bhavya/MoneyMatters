export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profilePicture?: string;
}

export interface Income {
  id: string;
  amount: number;
  type: 'cash' | 'card';
  date: string;
  taxable: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  type: string;
  category: string;
  date: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export interface TaxInfo {
  taxableIncome: number;
  taxRate: number;
  deductions: number;
  taxPayable: number;
}