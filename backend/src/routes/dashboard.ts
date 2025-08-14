import express from 'express';
import { query, validationResult } from 'express-validator';
import Sale from '../models/Sale';
import Expense from '../models/Expense';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/dashboard/recent-transactions
// @desc    Get recent sales and expenses for dashboard
// @access  Private
router.get('/recent-transactions', [
  query('limit').optional().isInt({ min: 1, max: 50 })
], authMiddleware, async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user._id;

    // Get recent sales
    const recentSales = await Sale.find({ userId })
      .sort({ saleDate: -1 })
      .limit(Math.ceil(limit / 2))
      .select('_id productName totalAmount saleDate category')
      .lean();

    // Get recent expenses
    const recentExpenses = await Expense.find({ userId })
      .sort({ expenseDate: -1 })
      .limit(Math.ceil(limit / 2))
      .select('_id title amount expenseDate category description')
      .lean();

    // Combine and format transactions
    const transactions = [
      ...recentSales.map(sale => ({
        id: sale._id.toString(),
        type: 'sale' as const,
        title: sale.productName,
        amount: sale.totalAmount,
        date: sale.saleDate,
        category: sale.category
      })),
      ...recentExpenses.map(expense => ({
        id: expense._id.toString(),
        type: 'expense' as const,
        title: expense.title,
        amount: expense.amount,
        date: expense.expenseDate,
        category: expense.category,
        description: expense.description
      }))
    ];

    // Sort by date (most recent first) and limit
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const limitedTransactions = transactions.slice(0, limit);

    res.json({
      success: true,
      data: limitedTransactions
    });
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting recent transactions'
    });
  }
});

export default router;