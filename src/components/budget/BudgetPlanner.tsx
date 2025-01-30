import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFinanceStore } from '../../store/financeStore';
import { PieChart, BarChart } from 'lucide-react';

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  limit: z.number().min(0.01, 'Limit must be greater than 0'),
});

type BudgetForm = z.infer<typeof budgetSchema>;

const categories = [
  'Housing',
  'Transportation',
  'Food',
  'Utilities',
  'Insurance',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Other',
];

function BudgetPlanner() {
  const { expenses, budgets, updateBudget } = useFinanceStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
  });

  const onSubmit = (data: BudgetForm) => {
    const spent = expenses
      .filter((expense) => expense.category === data.category)
      .reduce((sum, expense) => sum + expense.amount, 0);

    updateBudget({
      id: crypto.randomUUID(),
      category: data.category,
      limit: data.limit,
      spent,
    });
    reset();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Budget Planner</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Set Budget
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                {...register('category')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Budget Limit
              </label>
              <input
                type="number"
                step="0.01"
                {...register('limit', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.limit && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.limit.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Set Budget
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Budget Overview
          </h2>
          <div className="space-y-4">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const isOverBudget = percentage > 100;

              return (
                <div
                  key={budget.id}
                  className="p-4 bg-gray-50 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isOverBudget ? 'bg-red-100' : 'bg-green-100'
                        }`}
                      >
                        {isOverBudget ? (
                          <BarChart
                            className="w-5 h-5 text-red-600"
                          />
                        ) : (
                          <PieChart
                            className="w-5 h-5 text-green-600"
                          />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {budget.category}
                      </span>
                    </div>
                    <span
                      className={`font-semibold ${
                        isOverBudget ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        isOverBudget
                          ? 'bg-red-600'
                          : percentage > 80
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>
                      {percentage.toFixed(1)}% {isOverBudget ? 'Over' : 'Used'}
                    </span>
                    <span>
                      ${Math.abs(budget.limit - budget.spent).toFixed(2)}{' '}
                      {isOverBudget ? 'Over' : 'Remaining'}
                    </span>
                  </div>
                </div>
              );
            })}

            {budgets.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No budgets set. Add a budget to start tracking your spending.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetPlanner;