import React from 'react';
import { useFinanceStore } from '../store/financeStore';
import { BarChart as BarChartIcon, DollarSign, CreditCard, PieChart, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartPieChart, Pie, Cell } from 'recharts';

function Dashboard() {
  const { incomes, expenses } = useFinanceStore();

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Calculate month-over-month growth
  const currentMonthIncome = incomes
    .filter(income => new Date(income.date).getMonth() === new Date().getMonth())
    .reduce((sum, income) => sum + income.amount, 0);

  const lastMonthIncome = incomes
    .filter(income => new Date(income.date).getMonth() === new Date().getMonth() - 1)
    .reduce((sum, income) => sum + income.amount, 0);

  const growth = lastMonthIncome ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;

  // Prepare data for charts
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const monthIncome = incomes
      .filter(income => new Date(income.date).getMonth() === month.getMonth())
      .reduce((sum, income) => sum + income.amount, 0);
    const monthExpenses = expenses
      .filter(expense => new Date(expense.date).getMonth() === month.getMonth())
      .reduce((sum, expense) => sum + expense.amount, 0);
    return {
      name: month.toLocaleString('default', { month: 'short' }),
      income: monthIncome,
      expenses: monthExpenses,
    };
  }).reverse();

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const stats = [
    {
      title: 'Total Income',
      amount: totalIncome,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: growth,
    },
    {
      title: 'Total Expenses',
      amount: totalExpenses,
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Balance',
      amount: balance,
      icon: BarChartIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Monthly Growth',
      amount: growth,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      isPercentage: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Last updated:</span>
          <span className="font-medium">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg shadow-lg p-6 space-y-4 transform hover:scale-105 transition-transform duration-200"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-500">
                {stat.title}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">
                {stat.isPercentage
                  ? `${stat.amount.toFixed(1)}%`
                  : `$${stat.amount.toFixed(2)}`}
              </div>
              {stat.trend !== undefined && (
                <div className={`flex items-center ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{Math.abs(stat.trend).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Income vs Expenses
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Expense Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Income
            </h2>
            <span className="text-sm text-gray-500">Last 5 transactions</span>
          </div>
          <div className="space-y-4">
            {incomes.slice(0, 5).map((income) => (
              <div
                key={income.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{income.type}</p>
                    <p className="text-sm text-gray-500">{income.date}</p>
                  </div>
                </div>
                <span className="font-semibold text-green-600">
                  +${income.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Expenses
            </h2>
            <span className="text-sm text-gray-500">Last 5 transactions</span>
          </div>
          <div className="space-y-4">
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{expense.category}</p>
                    <p className="text-sm text-gray-500">{expense.date}</p>
                  </div>
                </div>
                <span className="font-semibold text-red-600">
                  -${expense.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;