import React, { useState, useEffect } from 'react';

export const CATEGORIES = ['Food', 'Rent', 'Salary', 'Entertainment', 'Utilities', 'Transportation', 'Healthcare', 'Shopping', 'Other'];

const emptyForm = {
  title: '',
  amount: '',
  category: 'Food',
  type: 'expense',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

/**
 * Modal form used to both create and edit a transaction.
 * Pass `editingTransaction` to pre-fill the form for edit mode.
 */
const ExpenseForm = ({ isOpen, onClose, onSubmit, editingTransaction }) => {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        title: editingTransaction.title || '',
        amount: editingTransaction.amount ?? '',
        category: editingTransaction.category || 'Other',
        type: editingTransaction.type || 'expense',
        date: editingTransaction.date ? editingTransaction.date.slice(0, 10) : emptyForm.date,
        notes: editingTransaction.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
    setFormError('');
  }, [editingTransaction, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim()) {
      setFormError('Please enter a title.');
      return;
    }
    const numericAmount = parseFloat(form.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Please enter an amount greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...form, amount: numericAmount });
      setForm(emptyForm);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] border border-gray-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-neutral-950 sm:max-w-md sm:rounded-[28px] sm:p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:text-white/40 dark:hover:text-white"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-4 pr-8 text-lg font-semibold tracking-tight">
          {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </h2>

        {formError && (
          <div className="alert-error mb-4">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, type: 'expense' }))}
              className={`rounded-xl border py-2 text-sm font-medium transition-colors ${
                form.type === 'expense'
                  ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-300'
                  : 'border-gray-200 bg-gray-50 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/50'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, type: 'income' }))}
              className={`rounded-xl border py-2 text-sm font-medium transition-colors ${
                form.type === 'income'
                  ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-500/40 dark:bg-green-500/15 dark:text-green-300'
                  : 'border-gray-200 bg-gray-50 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/50'
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="label">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Grocery shopping"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="input"
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Saving...' : editingTransaction ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
