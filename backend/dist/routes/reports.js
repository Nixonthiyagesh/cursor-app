"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Sale_1 = __importDefault(require("../models/Sale"));
const Expense_1 = __importDefault(require("../models/Expense"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @route   GET /api/reports/profit-loss
// @desc    Get profit & loss report
// @access  Private
router.get('/profit-loss', [
    (0, express_validator_1.query)('startDate').isISO8601(),
    (0, express_validator_1.query)('endDate').isISO8601()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { startDate, endDate } = req.query;
        const filter = {
            userId: req.user._id,
            saleDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
        const expenseFilter = {
            userId: req.user._id,
            expenseDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
        const [salesData, expensesData] = await Promise.all([
            Sale_1.default.aggregate([
                { $match: filter },
                { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
            ]),
            Expense_1.default.aggregate([
                { $match: expenseFilter },
                { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
            ])
        ]);
        const totalRevenue = salesData[0]?.totalRevenue || 0;
        const totalExpenses = expensesData[0]?.totalExpenses || 0;
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        res.json({
            success: true,
            data: {
                period: { startDate, endDate },
                totalRevenue,
                totalExpenses,
                netProfit,
                profitMargin: profitMargin.toFixed(2),
                currency: 'USD'
            }
        });
    }
    catch (error) {
        console.error('Get profit-loss report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating profit-loss report'
        });
    }
});
// @route   GET /api/reports/sales-analysis
// @desc    Get detailed sales analysis
// @access  Private
router.get('/sales-analysis', [
    (0, express_validator_1.query)('startDate').isISO8601(),
    (0, express_validator_1.query)('endDate').isISO8601()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { startDate, endDate } = req.query;
        const filter = {
            userId: req.user._id,
            saleDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
        const [dailySales, categoryBreakdown, paymentMethodBreakdown, topProducts] = await Promise.all([
            Sale_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
                        totalSales: { $sum: 1 },
                        totalRevenue: { $sum: '$totalAmount' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Sale_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$category',
                        totalSales: { $sum: 1 },
                        totalRevenue: { $sum: '$totalAmount' },
                        avgOrderValue: { $avg: '$totalAmount' }
                    }
                },
                { $sort: { totalRevenue: -1 } }
            ]),
            Sale_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$paymentMethod',
                        totalSales: { $sum: 1 },
                        totalRevenue: { $sum: '$totalAmount' }
                    }
                }
            ]),
            Sale_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$productName',
                        totalQuantity: { $sum: '$quantity' },
                        totalRevenue: { $sum: '$totalAmount' }
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: 10 }
            ])
        ]);
        res.json({
            success: true,
            data: {
                period: { startDate, endDate },
                dailySales,
                categoryBreakdown,
                paymentMethodBreakdown,
                topProducts
            }
        });
    }
    catch (error) {
        console.error('Get sales analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating sales analysis'
        });
    }
});
// @route   GET /api/reports/expense-breakdown
// @desc    Get detailed expense breakdown
// @access  Private
router.get('/expense-breakdown', [
    (0, express_validator_1.query)('startDate').isISO8601(),
    (0, express_validator_1.query)('endDate').isISO8601()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { startDate, endDate } = req.query;
        const filter = {
            userId: req.user._id,
            expenseDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
        const [categoryBreakdown, monthlyBreakdown, recurringExpenses, vendorBreakdown] = await Promise.all([
            Expense_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$category',
                        totalExpenses: { $sum: '$amount' },
                        count: { $sum: 1 },
                        avgAmount: { $avg: '$amount' }
                    }
                },
                { $sort: { totalExpenses: -1 } }
            ]),
            Expense_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: {
                            year: { $year: '$expenseDate' },
                            month: { $month: '$expenseDate' }
                        },
                        totalExpenses: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            Expense_1.default.aggregate([
                { $match: { ...filter, isRecurring: true } },
                {
                    $group: {
                        _id: '$category',
                        totalAmount: { $sum: '$amount' },
                        recurringPeriod: { $first: '$recurringPeriod' }
                    }
                }
            ]),
            Expense_1.default.aggregate([
                { $match: { ...filter, vendor: { $exists: true, $ne: '' } } },
                {
                    $group: {
                        _id: '$vendor',
                        totalExpenses: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { totalExpenses: -1 } },
                { $limit: 10 }
            ])
        ]);
        res.json({
            success: true,
            data: {
                period: { startDate, endDate },
                categoryBreakdown,
                monthlyBreakdown,
                recurringExpenses,
                vendorBreakdown
            }
        });
    }
    catch (error) {
        console.error('Get expense breakdown error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating expense breakdown'
        });
    }
});
// @route   GET /api/reports/export/excel
// @desc    Export report to Excel (Pro plan only)
// @access  Private
router.get('/export/excel', auth_1.proPlanMiddleware, [
    (0, express_validator_1.query)('startDate').isISO8601(),
    (0, express_validator_1.query)('endDate').isISO8601(),
    (0, express_validator_1.query)('reportType').isIn(['sales', 'expenses', 'profit-loss'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        // This would generate and return an Excel file
        // For now, return success message
        res.json({
            success: true,
            message: 'Excel export feature coming soon for Pro users',
            data: {
                reportType: req.query.reportType,
                period: { startDate: req.query.startDate, endDate: req.query.endDate }
            }
        });
    }
    catch (error) {
        console.error('Excel export error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during Excel export'
        });
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map