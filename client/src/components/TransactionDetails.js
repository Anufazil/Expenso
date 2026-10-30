import React, { useEffect } from 'react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(value || 0);

const formatLongDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

const GRADIENTS = {
  income: 'linear-gradient(180deg,#a6e8c8 0%,#36956f 40%,#36956f 75%,#58b58c 100%)',
  expense: 'linear-gradient(180deg,#ffb3d6 0%,#ff2a85 40%,#ff2a85 75%,#ff6aa8 100%)',
};

const Row = ({ label, children, mono }) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <dt className="flex-none text-sm text-gray-500 dark:text-white/50">{label}</dt>
    <dd className={`min-w-0 break-words text-right text-sm font-medium ${mono ? 'font-mono text-xs' : ''}`}>{children}</dd>
  </div>
);

/** Read-only "view mode" for a single transaction. */
const TransactionDetails = ({ transaction, onClose, onEdit, onDelete }) => {
  // Close on Escape + lock background scroll while open
  useEffect(() => {
    if (!transaction) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [transaction, onClose]);

  if (!transaction) return null;
  const t = transaction;
  const isIncome = t.type === 'income';

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Transaction details"
    >
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-950 sm:max-w-md sm:rounded-[28px]">
        {/* Header */}
        <div className="relative p-5 text-white sm:p-6" style={{ background: GRADIENTS[isIncome ? 'income' : 'expense'] }}>
          <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white transition hover:bg-black/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="inline-flex h-6 items-center rounded-full bg-black/80 px-2.5 text-[11px] font-semibold uppercase tracking-wide">
            {isIncome ? 'Income' : 'Expense'}
          </span>
          <h2 className="mt-3 break-words pr-8 text-xl font-semibold tracking-tight">{t.title}</h2>
          <p className="mt-2 break-words text-4xl font-extralight tabular-nums tracking-tight">
            {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
          </p>
        </div>

        {/* Details */}
        <dl className="divide-y divide-gray-100 px-5 py-2 dark:divide-white/10 sm:px-6">
          <Row label="Category">
            <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs dark:bg-white/10">{t.category}</span>
          </Row>
          <Row label="Type">{isIncome ? 'Income' : 'Expense'}</Row>
          <Row label="Date">{formatLongDate(t.date)}</Row>
          <Row label="Notes">
            {t.notes ? <span className="whitespace-pre-wrap font-normal">{t.notes}</span> : <span className="font-normal text-gray-400 dark:text-white/30">No notes</span>}
          </Row>
          <Row label="Added on">{formatDateTime(t.createdAt)}</Row>
          <Row label="Last updated">{formatDateTime(t.updatedAt)}</Row>
          <Row label="Transaction ID" mono>{t._id}</Row>
        </dl>

        {/* Actions: Edit/Delete only when handlers are provided (read-only elsewhere) */}
        <div className={`grid gap-2 p-5 pt-3 sm:p-6 sm:pt-3 ${onEdit && onDelete ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {onEdit && <button onClick={() => onEdit(t)} className="btn-primary">Edit</button>}
          {onDelete && (
            <button onClick={() => onDelete(t._id)} className="btn-ghost !text-red-600 hover:!border-red-200 dark:!text-red-400">Delete</button>
          )}
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
