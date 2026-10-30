import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import CategoryPieChart from '../components/Charts/CategoryPieChart';
import TransactionDetails from '../components/TransactionDetails';
import { useAuth } from '../context/AuthContext';
import { getMonthlyReport } from '../services/api';
import { exportCSV, exportPDF, monthLabel } from '../utils/exportReport';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n) => String(n).padStart(2, '0');
const isValidMonth = (s) => /^\d{4}-(0[1-9]|1[0-2])$/.test(s || '');
const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const shiftMonth = (ym, delta) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

const dayLabel = (key) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

const ChevronButton = ({ dir, onClick, label }) => (
  <button type="button" onClick={onClick} aria-label={label} title={label} className="btn-ghost !h-10 !w-10 !p-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'prev' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
    </svg>
  </button>
);

const MonthlyReport = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = searchParams.get('month');
  const month = isValidMonth(requested) ? requested : currentMonth();
  const [year, monthNum] = month.split('-').map(Number);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const setMonth = (ym) => setSearchParams({ month: ym }, { replace: true });

  // Load whenever the selected month changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getMonthlyReport(month)
      .then((res) => !cancelled && setReport(res.data))
      .catch((err) => !cancelled && setError(err.response?.data?.message || 'Failed to load this month. Please try again.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [month]);

  // Year choices: last 10 years through next year (always including the selected year)
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const set = new Set([year]);
    for (let y = now - 10; y <= now + 1; y += 1) set.add(y);
    return [...set].sort((a, b) => b - a);
  }, [year]);

  // Group the month's transactions by day (API returns newest first)
  const groups = useMemo(() => {
    if (!report) return [];
    const map = new Map();
    report.transactions.forEach((t) => {
      const key = new Date(t.date).toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, { key, items: [], net: 0 });
      const g = map.get(key);
      g.items.push(t);
      g.net += t.type === 'income' ? t.amount : -t.amount;
    });
    return [...map.values()];
  }, [report]);

  const hasData = !!report && report.transactions.length > 0;
  const isThisMonth = month === currentMonth();

  const handlePDF = async () => {
    setExporting(true);
    setExportError('');
    try {
      await exportPDF(report, user);
    } catch (err) {
      console.error('PDF export failed', err);
      setExportError('Could not generate the PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleCSV = () => {
    setExportError('');
    try {
      exportCSV(report);
    } catch (err) {
      console.error('CSV export failed', err);
      setExportError('Could not generate the CSV file. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link to="/dashboard" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        {/* Title + downloads */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Monthly Report</h1>
            <p className="text-sm text-gray-500 dark:text-white/50">Every transaction for {monthLabel(month)}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button onClick={handlePDF} disabled={!hasData || exporting} className="btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {exporting ? 'Preparing...' : 'Download PDF'}
            </button>
            <button onClick={handleCSV} disabled={!hasData} className="btn-ghost disabled:cursor-not-allowed disabled:opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV
            </button>
          </div>
        </div>

        {/* Month picker */}
        <div className="card mb-5 flex flex-wrap items-center gap-2 p-3 sm:p-4">
          <ChevronButton dir="prev" label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))} />

          <select
            value={monthNum}
            onChange={(e) => setMonth(`${year}-${pad(e.target.value)}`)}
            className="input !w-auto min-w-0 flex-1 sm:flex-none"
            aria-label="Month"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setMonth(`${e.target.value}-${pad(monthNum)}`)}
            className="input !w-auto min-w-0 flex-1 sm:flex-none"
            aria-label="Year"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <ChevronButton dir="next" label="Next month" onClick={() => setMonth(shiftMonth(month, 1))} />

          {!isThisMonth && (
            <button onClick={() => setMonth(currentMonth())} className="btn-ghost ml-auto !py-2.5 text-xs sm:text-sm">
              This month
            </button>
          )}
        </div>

        {error && <div className="alert-error mb-4">{error}</div>}
        {exportError && <div className="alert-error mb-4">{exportError}</div>}

        {loading && !report ? (
          <p className="py-16 text-center text-sm text-gray-400 dark:text-white/40">Loading {monthLabel(month)}...</p>
        ) : report ? (
          <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            {/* Summary */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">
              <SummaryCard title="Balance" amount={report.totals.balance} variant="balance" />
              <SummaryCard title="Income" amount={report.totals.totalIncome} variant="income" />
              <SummaryCard title="Expense" amount={report.totals.totalExpense} variant="expense" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
              {/* Category breakdown */}
              <div className="lg:col-span-1">
                <CategoryPieChart data={report.categoryBreakdown} />
              </div>

              {/* All transactions of the month, grouped by day */}
              <div className="card p-4 sm:p-6 lg:col-span-2">
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold tracking-tight">Transactions</h2>
                  <span className="text-xs text-gray-500 dark:text-white/40">
                    {report.totals.count} in {monthLabel(month)}
                  </span>
                </div>

                {groups.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-gray-500 dark:text-white/50">No transactions in {monthLabel(month)}.</p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-white/30">Pick another month, or add transactions from the dashboard.</p>
                  </div>
                ) : (
                  <div className="scrollbar-thin max-h-[36rem] overflow-y-auto pr-1">
                    {groups.map((g) => (
                      <section key={g.key} className="mb-2">
                        <div className="sticky top-0 z-10 flex items-center justify-between bg-white/90 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 backdrop-blur dark:bg-neutral-950/90 dark:text-white/40">
                          <span>{dayLabel(g.key)}</span>
                          <span className={`font-mono normal-case tracking-normal ${g.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {g.net >= 0 ? '+' : '-'}{formatCurrency(Math.abs(g.net))}
                          </span>
                        </div>
                        <ul className="divide-y divide-gray-100 dark:divide-white/10">
                          {g.items.map((t) => {
                            const isIncome = t.type === 'income';
                            return (
                              <li key={t._id}>
                                <button
                                  type="button"
                                  onClick={() => setViewing(t)}
                                  aria-label={`View details of ${t.title}`}
                                  className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-white/5 dark:focus-visible:ring-accent"
                                >
                                  <div className={`flex h-9 w-9 flex-none items-center justify-center rounded-full ${isIncome ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d={isIncome ? 'M7 11l5-5m0 0l5 5m-5-5v12' : 'M17 13l-5 5m0 0l-5-5m5 5V6'} />
                                    </svg>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{t.title}</p>
                                    <p className="truncate text-xs text-gray-500 dark:text-white/40">
                                      {t.category}{t.notes ? ` · ${t.notes}` : ''}
                                    </p>
                                  </div>
                                  <p className={`flex-none text-sm font-semibold tabular-nums ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                                  </p>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Read-only details (no edit/delete handlers on this page) */}
      <TransactionDetails transaction={viewing} onClose={() => setViewing(null)} />
    </div>
  );
};

export default MonthlyReport;
