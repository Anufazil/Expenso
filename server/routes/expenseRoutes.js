const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
  getExpensesByCategory,
  getMonthlyAnalytics,
  getMonthlyReport,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

// All routes below require a valid JWT
router.use(protect);

router.route('/').get(getExpenses).post(createExpense);
router.route('/:id').put(updateExpense).delete(deleteExpense);

router.get('/summary', getSummary);
router.get('/report', getMonthlyReport);
router.get('/analytics/by-category', getExpensesByCategory);
router.get('/analytics/monthly', getMonthlyAnalytics);

module.exports = router;
