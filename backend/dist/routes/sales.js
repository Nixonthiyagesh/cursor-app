"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Sale_1 = __importDefault(require("../models/Sale"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @route   POST /api/sales
// @desc    Create a new sale
// @access  Private
router.post('/', auth_1.authMiddleware, [
    (0, express_validator_1.body)('customerName').trim().notEmpty(),
    (0, express_validator_1.body)('productName').trim().notEmpty(),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }),
    (0, express_validator_1.body)('unitPrice').isFloat({ min: 0 }),
    (0, express_validator_1.body)('category').trim().notEmpty(),
    (0, express_validator_1.body)('paymentMethod').isIn(['cash', 'card', 'transfer', 'other'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
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
        const sale = new Sale_1.default(saleData);
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
    }
    catch (error) {
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
router.get('/', auth_1.authMiddleware, [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601(),
    (0, express_validator_1.query)('category').optional().trim(),
    (0, express_validator_1.query)('customerName').optional().trim()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
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
        const filter = { userId: req.user._id };
        if (req.query.startDate || req.query.endDate) {
            filter.saleDate = {};
            if (req.query.startDate)
                filter.saleDate.$gte = new Date(req.query.startDate);
            if (req.query.endDate)
                filter.saleDate.$lte = new Date(req.query.endDate);
        }
        if (req.query.category)
            filter.category = req.query.category;
        if (req.query.customerName) {
            filter.customerName = { $regex: req.query.customerName, $options: 'i' };
        }
        const [sales, total] = await Promise.all([
            Sale_1.default.find(filter)
                .sort({ saleDate: -1 })
                .skip(skip)
                .limit(limit),
            Sale_1.default.countDocuments(filter)
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
    }
    catch (error) {
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
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const sale = await Sale_1.default.findOne({
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
    }
    catch (error) {
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
router.put('/:id', auth_1.authMiddleware, [
    (0, express_validator_1.body)('customerName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('productName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('quantity').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('unitPrice').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('category').optional().trim().notEmpty(),
    (0, express_validator_1.body)('paymentMethod').optional().isIn(['cash', 'card', 'transfer', 'other'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const sale = await Sale_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true, runValidators: true });
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
    }
    catch (error) {
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
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const sale = await Sale_1.default.findOneAndDelete({
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
    }
    catch (error) {
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
router.get('/stats/summary', auth_1.authMiddleware, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = { userId: req.user._id };
        if (startDate || endDate) {
            filter.saleDate = {};
            if (startDate)
                filter.saleDate.$gte = new Date(startDate);
            if (endDate)
                filter.saleDate.$lte = new Date(endDate);
        }
        const [totalSales, totalRevenue, avgOrderValue, topCategories] = await Promise.all([
            Sale_1.default.countDocuments(filter),
            Sale_1.default.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Sale_1.default.aggregate([
                { $match: filter },
                { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
            ]),
            Sale_1.default.aggregate([
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
    }
    catch (error) {
        console.error('Get sales stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching sales statistics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=sales.js.map