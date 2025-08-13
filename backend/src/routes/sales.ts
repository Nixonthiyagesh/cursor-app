import express, { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import Sale from '../models/Sale';

// Extend Request interface for authenticated routes
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// @route   POST /api/sales
// @desc    Create a new sale
// @access  Private
router.post('/', [
  body('customerName').trim().notEmpty(),
  body('productName').trim().notEmpty(),
  body('quantity').isInt({ min: 1 }),
  body('unitPrice').isFloat({ min: 0 }),
  body('category').trim().notEmpty(),
  body('paymentMethod').isIn(['cash', 'card', 'transfer', 'other'])
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const saleData = {
      ...req.body,
      userId: req.user._id,
      saleDate: req.body.saleDate || new Date()
    };

    const sale = new Sale(saleData);
    await sale.save();

    // Emit real-time update for Pro users
    if (req.app.get('io') && req.user.plan === 'pro') {
      req.app.get('io').to(`user-${req.user._id}`).emit('sale-added', sale);
    }

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: { sale }
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating sale'
    });
  }
});

// @route   GET /api/sales
// @desc    Get all sales for user with filters
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('category').optional().trim(),
  query('customerName').optional().trim()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { userId: req.user._id };
    
    if (req.query.startDate || req.query.endDate) {
      filter.saleDate = {};
      if (req.query.startDate) filter.saleDate.$gte = new Date(req.query.startDate as string);
      if (req.query.endDate) filter.saleDate.$lte = new Date(req.query.endDate as string);
    }
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.customerName) {
      filter.customerName = { $regex: req.query.customerName, $options: 'i' };
    }

    const [sales, total] = await Promise.all([
      Sale.find(filter)
        .sort({ saleDate: -1 })
        .skip(skip)
        .limit(limit),
      Sale.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sales'
    });
  }
});

// @route   GET /api/sales/:id
// @desc    Get sale by ID
// @access  Private
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const sale = await Sale.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: { sale }
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sale'
    });
  }
});

// @route   PUT /api/sales/:id
// @desc    Update sale
// @access  Private
router.put('/:id', [
  body('customerName').optional().trim().notEmpty(),
  body('productName').optional().trim().notEmpty(),
  body('quantity').optional().isInt({ min: 1 }),
  body('unitPrice').optional().isFloat({ min: 0 }),
  body('category').optional().trim().notEmpty(),
  body('paymentMethod').optional().isIn(['cash', 'card', 'transfer', 'other'])
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const sale = await Sale.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Emit real-time update for Pro users
    if (req.app.get('io') && req.user.plan === 'pro') {
      req.app.get('io').to(`user-${req.user._id}`).emit('sale-updated', sale);
    }

    res.json({
      success: true,
      message: 'Sale updated successfully',
      data: { sale }
    });
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating sale'
    });
  }
});

// @route   DELETE /api/sales/:id
// @desc    Delete sale
// @access  Private
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const sale = await Sale.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Emit real-time update for Pro users
    if (req.app.get('io') && req.user.plan === 'pro') {
      req.app.get('io').to(`user-${req.user._id}`).emit('sale-deleted', req.params.id);
    }

    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting sale'
    });
  }
});

// @route   GET /api/sales/stats/summary
// @desc    Get sales summary statistics
// @access  Private
router.get('/stats/summary', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter: any = { userId: req.user._id };
    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) filter.saleDate.$gte = new Date(startDate as string);
      if (endDate) filter.saleDate.$lte = new Date(endDate as string);
    }

    const [totalSales, totalRevenue, avgOrderValue, topCategories] = await Promise.all([
      Sale.countDocuments(filter),
      Sale.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Sale.aggregate([
        { $match: filter },
        { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
      ]),
      Sale.aggregate([
        { $match: filter },
        { $group: { _id: '$category', total: { $sum: '$totalAmount' } } },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalSales,
        totalRevenue: totalRevenue[0]?.total || 0,
        avgOrderValue: avgOrderValue[0]?.avg || 0,
        topCategories
      }
    });
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sales statistics'
    });
  }
});

export default router;