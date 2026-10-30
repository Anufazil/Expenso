import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import TransactionDetails from '../components/TransactionDetails';
import CategoryPieChart from '../components/Charts/CategoryPieChart';
import MonthlyBarChart from '../components/Charts/MonthlyBarChart';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getCategoryAnalytics,
  getMonthlyAnalytics,
} from '../services/api';

const emptyFilters = { type: '', category: '', startDate: '', endDate: '' };

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState(emptyFilters);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const [loadingList, setLoadingList] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [pageError, setPageError] = useState('');

  const fetchSummary = useCallback(async () => {
    try {
      const res = await getSummary();
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load summary', err);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const [catRes, monthRes] = await Promise.all([getCategoryAnalytics(), getMonthlyAnalytics()]);
      setCategoryData(catRes.data);
      setMonthlyData(monthRes.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  }, []);

  const fetchTransactions = useCallback(
    async (page = 1) => {
      setLoadingList(true);
      setPageError('');
      try {
        const params = { page, limit: 8 };
        if (filters.type) params.type = filters.type;
        if (filters.category) params.category = filters.category;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        const res = await getTransactions(params);
        setTransactions(res.data.transactions);
        setPagination({ page: res.data.pagination.page, totalPages: res.data.pagination.totalPages });
      } catch (err) {
        setPageError('Failed to load transactions. Please try again.');
      } finally {
        setLoadingList(false);
      }
    },
    [filters]
  );

  // Reload transactions whenever filters change (reset to page 1)
  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  // Load summary + analytics once on mount
  useEffect(() => {
    fetchSummary();
    fetchAnalytics();
  }, [fetchSummary, fetchAnalytics]);

  const refreshAll = () => {
    fetchTransactions(pagination.page);
    fetchSummary();
    fetchAnalytics();
  };

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleEditFromDetails = (transaction) => {
    setViewingTransaction(null);
    handleOpenEdit(transaction);
  };

  const handleFormSubmit = async (formData) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction._id, formData);
    } else {
      await createTransaction(formData);
    }
    setIsFormOpen(false);
    setEditingTransaction(null);
    refreshAll();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
    try {
      await deleteTransaction(id);
      setViewingTransaction(null);
      refreshAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction.');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-white/50">Here's an overview of your finances</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/monthly" className="btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
              </svg>
              Monthly Report
            </Link>
            <button
              onClick={handleOpenAdd}
              className="btn-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Transaction
            </button>
          </div>
        </div>

        {pageError && (
          <div className="alert-error mb-4">
            {pageError}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 mb-4 sm:mb-6">
          <SummaryCard title="Total Balance" amount={summary.balance} variant="balance" />
          <SummaryCard title="Total Income" amount={summary.totalIncome} variant="income" />
          <SummaryCard title="Total Expense" amount={summary.totalExpense} variant="expense" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 mb-4 sm:mb-6">
          <CategoryPieChart data={categoryData} />
          <MonthlyBarChart data={monthlyData} onSelectMonth={(m) => navigate(`/monthly?month=${m}`)} />
        </div>

        {/* Transaction History */}
        <ExpenseList
          transactions={transactions}
          filters={filters}
          onFilterChange={setFilters}
          pagination={pagination}
          onPageChange={fetchTransactions}
          onView={setViewingTransaction}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          loading={loadingList}
        />
      </main>

      <TransactionDetails
        transaction={viewingTransaction}
        onClose={() => setViewingTransaction(null)}
        onEdit={handleEditFromDetails}
        onDelete={handleDelete}
      />

      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleFormSubmit}
        editingTransaction={editingTransaction}
      />
    </div>
  );
};

export default Dashboard;
