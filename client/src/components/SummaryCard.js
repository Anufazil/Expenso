import React from 'react';

const iconWrapperStyles = {
  balance: 'bg-primary-100 text-primary-700',
  income: 'bg-green-100 text-green-700',
  expense: 'bg-red-100 text-red-700',
};

const icons = {
  balance: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  income: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
    </svg>
  ),
  expense: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
    </svg>
  ),
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

/**
 * variant: 'balance' | 'income' | 'expense'
 */
const SummaryCard = ({ title, amount, variant = 'balance' }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p
          className={`text-2xl font-bold mt-1 ${
            variant === 'expense' ? 'text-red-600' : variant === 'income' ? 'text-green-600' : 'text-gray-900'
          }`}
        >
          {formatCurrency(amount)}
        </p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconWrapperStyles[variant]}`}>
        {icons[variant]}
      </div>
    </div>
  );
};

export default SummaryCard;
