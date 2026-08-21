import React from 'react';
import { CATEGORIES } from './ExpenseForm';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * Props:
 *  - transactions: array
 *  - filters, onFilterChange
 *  - pagination: { page, totalPages }
 *  - onPageChange(page)
 *  - onEdit(transaction), onDelete(id)
 *  - loading: bool
 */
const ExpenseList = ({
  transactions,
  filters,
  onFilterChange,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  loading,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-gray-800">Transaction History</h2>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            className="text-xs rounded-lg border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="text-xs rounded-lg border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="text-xs rounded-lg border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-xs text-gray-400 self-center">to</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="text-xs rounded-lg border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {(filters.type || filters.category || filters.startDate || filters.endDate) && (
            <button
              onClick={() => onFilterChange({ type: '', category: '', startDate: '', endDate: '' })}
              className="text-xs text-primary-600 hover:underline px-1"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto scrollbar-thin">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No transactions found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                <th className="py-2 pr-2">Title</th>
                <th className="py-2 pr-2">Category</th>
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2 text-right">Amount</th>
                <th className="py-2 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 pr-2 font-medium text-gray-800">{t.title}</td>
                  <td className="py-2.5 pr-2">
                    <span className="inline-block text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-2.5 pr-2 text-gray-500">{formatDate(t.date)}</td>
                  <td
                    className={`py-2.5 pr-2 text-right font-semibold ${
                      t.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="py-2.5 pr-2">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(t)}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(t._id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
