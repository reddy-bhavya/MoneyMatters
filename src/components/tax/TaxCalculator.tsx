import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFinanceStore } from '../../store/financeStore';
import { Calculator, Plus, Minus, Trash2 } from 'lucide-react';

const taxSchema = z.object({
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100').optional(),
  deductions: z.number().min(0, 'Deductions must be positive').optional(),
  manualIncome: z.number().optional(),
  grossPay: z.number().optional(),
  netPay: z.number().optional(),
});

type TaxForm = z.infer<typeof taxSchema>;

function TaxCalculator() {
  const { incomes } = useFinanceStore();
  const [selectedIncomes, setSelectedIncomes] = React.useState<string[]>([]);
  const [calculationMode, setCalculationMode] = React.useState<'auto' | 'manual' | 'gross-net'>('auto');
  const [taxInfo, setTaxInfo] = React.useState<{
    taxableIncome?: number;
    taxRate?: number;
    deductions?: number;
    taxPayable?: number;
    taxesDeducted?: number;
    taxPercentage?: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaxForm>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      taxRate: 20,
      deductions: 0,
      manualIncome: 0,
      grossPay: undefined,
      netPay: undefined,
    },
  });

  const taxableIncomes = incomes.filter((income) => income.taxable);

  const handleIncomeToggle = (id: string) => {
    setSelectedIncomes(prev => 
      prev.includes(id) 
        ? prev.filter(incomeId => incomeId !== id)
        : [...prev, id]
    );
  };

  const calculateTaxableIncome = () => {
    if (calculationMode === 'manual') {
      return watch('manualIncome') || 0;
    }
    return selectedIncomes
      .map(id => taxableIncomes.find(income => income.id === id))
      .filter(Boolean)
      .reduce((sum, income) => sum + (income?.amount || 0), 0);
  };

  const onSubmit = (data: TaxForm) => {
    if (calculationMode === 'gross-net' && data.grossPay && data.netPay) {
      const taxesDeducted = data.grossPay - data.netPay;
      const taxPercentage = (taxesDeducted / data.grossPay) * 100;

      setTaxInfo({
        taxesDeducted,
        taxPercentage,
      });
    } else {
      const totalTaxableIncome = calculateTaxableIncome();
      const taxableAmount = Math.max(0, totalTaxableIncome - (data.deductions || 0));
      const taxPayable = (taxableAmount * (data.taxRate || 0)) / 100;

      setTaxInfo({
        taxableIncome: totalTaxableIncome,
        taxRate: data.taxRate,
        deductions: data.deductions,
        taxPayable,
      });
    }
  };

  const handleClear = () => {
    setSelectedIncomes([]);
    setTaxInfo(null);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tax Calculator</h1>
        <button
          onClick={handleClear}
          className="flex items-center px-4 py-2 text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Calculate Tax
          </h2>

          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setCalculationMode('auto')}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  calculationMode === 'auto'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Select Income
              </button>
              <button
                onClick={() => setCalculationMode('manual')}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  calculationMode === 'manual'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setCalculationMode('gross-net')}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  calculationMode === 'gross-net'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Gross/Net
              </button>
            </div>

            {calculationMode === 'auto' && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Select taxable income to include:
                </p>
                {taxableIncomes.map((income) => (
                  <div
                    key={income.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedIncomes.includes(income.id)
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                    onClick={() => handleIncomeToggle(income.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {selectedIncomes.includes(income.id) ? (
                          <Minus className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Plus className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm font-medium">
                          ${income.amount.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(income.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {taxableIncomes.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No taxable income recorded yet
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {calculationMode === 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Enter Taxable Income
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('manualIncome', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}

              {calculationMode === 'gross-net' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gross Pay
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('grossPay', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Net Pay
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('netPay', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('taxRate', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.taxRate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.taxRate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Deductions
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('deductions', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.deductions && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.deductions.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Calculate
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tax Summary
          </h2>
          <div className="space-y-4">
            {calculationMode !== 'gross-net' && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calculator className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">Selected Income</span>
                </div>
                <span className="font-semibold">
                  ${calculateTaxableIncome().toFixed(2)}
                </span>
              </div>
            )}

            {taxInfo && (
              <>
                {calculationMode === 'gross-net' ? (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Calculator className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="font-medium text-gray-900">Taxes Deducted</span>
                      </div>
                      <span className="font-semibold text-red-600">
                        ${taxInfo.taxesDeducted?.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Calculator className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-900">Tax Percentage</span>
                      </div>
                      <span className="font-semibold text-purple-600">
                        {taxInfo.taxPercentage?.toFixed(2)}%
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Calculator className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-900">Tax Rate</span>
                      </div>
                      <span className="font-semibold">{taxInfo.taxRate}%</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                          <Calculator className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="font-medium text-gray-900">Deductions</span>
                      </div>
                      <span className="font-semibold">
                        ${taxInfo.deductions?.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Calculator className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="font-medium text-gray-900">Tax Payable</span>
                      </div>
                      <span className="font-semibold text-red-600">
                        ${taxInfo.taxPayable?.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaxCalculator;