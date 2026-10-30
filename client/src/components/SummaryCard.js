import React from 'react';

// Gradient palettes taken from the finance-bento template
const GRADIENTS = {
  balance: 'linear-gradient(180deg,#b9a6ff 0%,#2e43ff 36%,#2e43ff 74%,#6d7dff 100%)',
  income: 'linear-gradient(180deg,#a6e8c8 0%,#36956f 36%,#36956f 74%,#58b58c 100%)',
  expense: 'linear-gradient(180deg,#ffb3d6 0%,#ff2a85 36%,#ff2a85 74%,#ff6aa8 100%)',
};

const icons = {
  balance: 'M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  income: 'M7 11l5-5m0 0l5 5m-5-5v12',
  expense: 'M17 13l-5 5m0 0l-5-5m5 5V6',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

/** variant: 'balance' | 'income' | 'expense' */
const SummaryCard = ({ title, amount, variant = 'balance' }) => (
  <div
    className="relative overflow-hidden rounded-[28px] p-5 text-white shadow-sm sm:p-6"
    style={{ background: GRADIENTS[variant] }}
  >
    <div className="flex items-start justify-between gap-3">
      <p className="text-[11.5px] font-semibold uppercase tracking-wider text-white/75">{title}</p>
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-black/25">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icons[variant]} />
        </svg>
      </div>
    </div>
    <p className="mt-5 break-words text-3xl font-extralight tabular-nums tracking-tight sm:mt-6 sm:text-4xl">
      {formatCurrency(amount)}
    </p>
    <div className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_0_0_1px_rgba(255,255,255,0.08)]" />
  </div>
);

export default SummaryCard;
