import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Income, Expense, Budget } from '../types';

interface FinanceState {
  incomes: Income[];
  expenses: Expense[];
  budgets: Budget[];
  addIncome: (income: Omit<Income, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteIncome: (id: string) => void;
  deleteExpense: (id: string) => void;
  clearIncomes: () => void;
  clearExpenses: () => void;
  updateBudget: (budget: Budget) => void;
  getTransactionHistory: () => (Income | Expense)[];
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      incomes: [],
      expenses: [],
      budgets: [],
      addIncome: (income) => {
        set((state) => ({
          incomes: [...state.incomes, { ...income, id: crypto.randomUUID() }],
        }));
      },
      addExpense: (expense) => {
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: crypto.randomUUID() }],
        }));
      },
      deleteIncome: (id) => {
        set((state) => ({
          incomes: state.incomes.filter((income) => income.id !== id),
        }));
      },
      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },
      clearIncomes: () => {
        set({ incomes: [] });
      },
      clearExpenses: () => {
        set({ expenses: [] });
      },
      updateBudget: (budget) => {
        set((state) => ({
          budgets: [
            ...state.budgets.filter((b) => b.id !== budget.id),
            budget,
          ],
        }));
      },
      getTransactionHistory: () => {
        const state = get();
        const allTransactions = [
          ...state.incomes.map(income => ({
            ...income,
            transactionType: 'income' as const
          })),
          ...state.expenses.map(expense => ({
            ...expense,
            transactionType: 'expense' as const
          }))
        ];
        
        return allTransactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },
    }),
    {
      name: 'finance-storage',
    }
  )
);