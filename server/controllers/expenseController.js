const mongoose = require('mongoose');
const Expense = require('../models/Expense');

// @route   GET /api/expenses
// @desc    Get all transactions for the logged-in user, with optional
//          filtering by type, category, and date range, plus pagination
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Expense.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limitNum),
      Expense.countDocuments(query),
    ]);

    return res.status(200).json({
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({ message: 'Server error while fetching transactions' });
  }
};

// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, type, date, notes } = req.body;

    if (!title || amount === undefined || !type) {
      return res.status(400).json({ message: 'Title, amount and type are required' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either "income" or "expense"' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category: category || 'Other',
      type,
      date: date || Date.now(),
      notes,
    });

    return res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error while creating transaction' });
  }
};

// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid transaction id' });
    }

    const expense = await Expense.findOne({ _id: id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { title, amount, category, type, date, notes } = req.body;

    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Type must be either "income" or "expense"' });
      }
      expense.type = type;
    }
    if (date !== undefined) expense.date = date;
    if (notes !== undefined) expense.notes = notes;

    const updated = await expense.save();

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Update expense error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error while updating transaction' });
  }
};

// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid transaction id' });
    }

    const expense = await Expense.findOneAndDelete({ _id: id, user: req.user._id });

    if (!expense) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json({ message: 'Transaction deleted successfully', id });
  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ message: 'Server error while deleting transaction' });
  }
};

// @route   GET /api/expenses/summary
// @desc    Total income, total expense, and balance for the logged-in user
// @access  Private
const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const results = await Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    results.forEach((r) => {
      if (r._id === 'income') totalIncome = r.total;
      if (r._id === 'expense') totalExpense = r.total;
    });

    return res.status(200).json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    console.error('Get summary error:', error);
    return res.status(500).json({ message: 'Server error while calculating summary' });
  }
};

// @route   GET /api/expenses/analytics/by-category
// @desc    Expense totals grouped by category (for pie/doughnut chart)
// @access  Private
const getExpensesByCategory = async (req, res) => {
  try {
    const userId = req.user._id;

    const results = await Expense.aggregate([
      { $match: { user: userId, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const formatted = results.map((r) => ({ category: r._id, total: r.total }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Get expenses by category error:', error);
    return res.status(500).json({ message: 'Server error while fetching category analytics' });
  }
};

// @route   GET /api/expenses/analytics/monthly
// @desc    Income vs expense totals grouped by month (for bar/line chart)
// @access  Private
const getMonthlyAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const results = await Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Reshape into { month: 'YYYY-MM', income, expense } records
    const monthMap = {};

    results.forEach((r) => {
      const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`;
      if (!monthMap[key]) {
        monthMap[key] = { month: key, income: 0, expense: 0 };
      }
      monthMap[key][r._id.type] = r.total;
    });

    const formatted = Object.values(monthMap).sort((a, b) => (a.month > b.month ? 1 : -1));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Get monthly analytics error:', error);
    return res.status(500).json({ message: 'Server error while fetching monthly analytics' });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
  getExpensesByCategory,
  getMonthlyAnalytics,
};
