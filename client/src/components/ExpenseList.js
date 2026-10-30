import React from 'react';
import { CATEGORIES } from './ExpenseForm';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

/**
 * Props:
 *  - transactions, filters, onFilterChange, pagination, onPageChange
 *  - onView(transaction)  -> opens the read-only details view (click a row)
 *  - onEdit(transaction), onDelete(id), loading
 */
const ExpenseList = ({ transactions, filters, onFilterChange, pagination, onPageChange, onView, onEdit, onDelete, loading }) => {
  const hasFilters = filters.type || filters.category || filters.startDate || filters.endDate;

  return (
    <div className="card p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Transaction History</h2>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <select value={filters.type} onChange={(e) => onFilterChange({ ...filters, type: e.target.value })} className="input-sm sm:!w-auto" aria-label="Filter by type">
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select value={filters.category} onChange={(e) => onFilterChange({ ...filters, category: e.target.value })} className="input-sm sm:!w-auto" aria-label="Filter by category">
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input type="date" value={filters.startDate} onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })} className="input-sm sm:!w-auto" aria-label="From date" />
          <input type="date" value={filters.endDate} onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })} className="input-sm sm:!w-auto" aria-label="To date" />

          {hasFilters && (
            <button
              onClick={() => onFilterChange({ type: '', category: '', startDate: '', endDate: '' })}
              className="col-span-2 text-xs font-medium text-primary-600 hover:underline dark:text-accent sm:col-span-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="scrollbar-thin max-h-[28rem] overflow-y-auto">
        {loading ? (
          <p className="py-10 text-center text-sm text-gray-400 dark:text-white/40">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400 dark:text-white/40">No transactions found.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {transactions.map((t) => {
              const isIncome = t.type === 'income';
              return (
                <li key={t._id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onView(t)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onView(t);
                      }
                    }}
                    aria-label={`View details of ${t.title}`}
                    className="-mx-2 flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-white/5 dark:focus-visible:ring-accent"
                  >
                    <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${isIncome ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={isIncome ? 'M7 11l5-5m0 0l5 5m-5-5v12' : 'M17 13l-5 5m0 0l-5-5m5 5V6'} />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="truncate text-xs text-gray-500 dark:text-white/40">
                        {t.category} · {formatDate(t.date)}
                      </p>
                    </div>

                    <p className={`flex-none text-sm font-semibold tabular-nums ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>

                    {/* Quick actions on larger screens; on phones use the details view */}
                    <div className="hidden flex-none gap-3 sm:flex" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <button onClick={() => onEdit(t)} className="text-xs font-medium text-primary-600 hover:underline dark:text-accent">Edit</button>
                      <button onClick={() => onDelete(t._id)} className="text-xs font-medium text-red-500 hover:underline">Delete</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/10">
          <span className="text-xs text-gray-400 dark:text-white/40">Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)} className="btn-ghost !px-3 !py-1.5 !text-xs disabled:opacity-40">Previous</button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => onPageChange(pagination.page + 1)} className="btn-ghost !px-3 !py-1.5 !text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
