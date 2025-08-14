import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Expense from '../models/Expense';

const router = express.Router();

// @route   POST /api/expenses
// @desc    Create a new expense
// @access  Private
router.post('/', [
  body('description').trim().notEmpty(),
  body('amount').isFloat({ min: 0.01 }),
  body('category').trim().notEmpty(),
  body('expenseDate').optional().isISO8601(),
  body('paymentMethod').optional().isIn(['cash', 'card', 'transfer', 'other'])
], async (req: any, res:any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const expenseData = {
      ...req.body,
      userId: req.user._id,
      expenseDate: req.body.expenseDate || new Date()
    };

    const expense = new Expense(expenseData);
    await expense.save();

    // Emit real-time update for Pro users
    if (req.app.get('io') && req.user.plan === 'pro') {
      req.app.get('io').to(`user-${req.user._id}`).emit('expense-added', expense);
    }

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { expense }
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating expense'
    });
  }
});

// @route   GET /api/expenses
// @desc    Get all expenses for user with filters
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('category').optional().trim(),
  query('minAmount').optional().isFloat({ min: 0 }),
  query('maxAmount').optional().isFloat({ min: 0 })
], async (req: any, res:any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { userId: req.user._id };
    
    if (req.query.startDate || req.query.endDate) {
      filter.expenseDate = {};
      if (req.query.startDate) filter.expenseDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.expenseDate.$lte = new Date(req.query.endDate);
    }
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.minAmount || req.query.maxAmount) {
      filter.amount = {};
      if (req.query.minAmount) filter.amount.$gte = parseFloat(req.query.minAmount);
      if (req.query.maxAmount) filter.amount.$lte = parseFloat(req.query.maxAmount);
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching expenses'
    });
  }
});

// @route   GET /api/expenses/stats/summary
// @desc    Get expense summary statistics
// @access  Private
router.get('/stats/summary', async (req: any, res:any) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter: any = { userId: req.user._id };
    if (startDate || endDate) {
      filter.expenseDate = {};
      if (startDate) filter.expenseDate.$gte = new Date(startDate);
      if (endDate) filter.expenseDate.$lte = new Date(endDate);
    }

    const [totalExpenses, totalAmount, avgExpense, topCategories] = await Promise.all([
      Expense.countDocuments(filter),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, avg: { $avg: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalExpenses,
        totalAmount: totalAmount[0]?.total || 0,
        avgExpense: avgExpense[0]?.avg || 0,
        topCategories
      }
    });
  } catch (error) {
    console.error('Get expense stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching expense statistics'
    });
  }
});

export default router;