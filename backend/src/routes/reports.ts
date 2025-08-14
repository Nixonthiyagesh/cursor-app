import express from 'express';
import { query, validationResult } from 'express-validator';
import Sale from '../models/Sale';
import Expense from '../models/Expense';
import { proPlanMiddleware } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/reports/profit-loss
// @desc    Get profit & loss report
// @access  Private
router.get('/profit-loss', [
  query('startDate').isISO8601(),
  query('endDate').isISO8601()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
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
      Sale.aggregate([
        { $match: filter },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Expense.aggregate([
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
  } catch (error) {
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
  query('startDate').isISO8601(),
  query('endDate').isISO8601()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
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
      Sale.aggregate([
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
      Sale.aggregate([
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
      Sale.aggregate([
        { $match: filter },
        { 
          $group: { 
            _id: '$paymentMethod',
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      Sale.aggregate([
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
  } catch (error) {
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
  query('startDate').isISO8601(),
  query('endDate').isISO8601()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
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
      Expense.aggregate([
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
      Expense.aggregate([
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
      Expense.aggregate([
        { $match: { ...filter, isRecurring: true } },
        { 
          $group: { 
            _id: '$category',
            totalAmount: { $sum: '$amount' },
            recurringPeriod: { $first: '$recurringPeriod' }
          }
        }
      ]),
      Expense.aggregate([
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
  } catch (error) {
    console.error('Get expense breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating expense breakdown'
    });
  }
});

// @route   GET /api/reports/profit-loss/export
// @desc    Export profit & loss report to Excel (Pro plan only)
// @access  Private
router.get('/profit-loss/export', proPlanMiddleware, [
  query('startDate').isISO8601(),
  query('endDate').isISO8601()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
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
      Sale.aggregate([
        { $match: filter },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Expense.aggregate([
        { $match: expenseFilter },
        { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
      ])
    ]);

    const totalRevenue = salesData[0]?.totalRevenue || 0;
    const totalExpenses = expensesData[0]?.totalExpenses || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Generate Excel file
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Profit & Loss Report');

    // Add headers
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 },
      { header: 'Details', key: 'details', width: 30 }
    ];

    // Add data
    worksheet.addRow({ metric: 'Period', value: `${startDate} to ${endDate}`, details: 'Report Date Range' });
    worksheet.addRow({ metric: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, details: 'All sales in period' });
    worksheet.addRow({ metric: 'Total Expenses', value: `$${totalExpenses.toFixed(2)}`, details: 'All expenses in period' });
    worksheet.addRow({ metric: 'Net Profit', value: `$${netProfit.toFixed(2)}`, details: 'Revenue minus Expenses' });
    worksheet.addRow({ metric: 'Profit Margin', value: `${profitMargin.toFixed(2)}%`, details: 'Net Profit / Revenue' });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=profit-loss-${startDate}-to-${endDate}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export profit-loss report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exporting profit-loss report'
    });
  }
});

// @route   GET /api/reports/sales-analysis/export
// @desc    Export sales analysis report to Excel (Pro plan only)
// @access  Private
router.get('/sales-analysis/export', proPlanMiddleware, [
  query('startDate').isISO8601(),
  query('endDate').isISO8601()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
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

    const [salesData, categoryData, dailyData] = await Promise.all([
      Sale.aggregate([
        { $match: filter },
        { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: filter },
        { $group: { _id: '$category', total: { $sum: '$totalAmount' } } },
        { $sort: { total: -1 } }
      ]),
      Sale.aggregate([
        { $match: filter },
        { 
          $group: { 
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
            total: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const totalSales = salesData[0]?.totalSales || 0;
    const totalOrders = salesData[0]?.totalOrders || 0;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Generate Excel file
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Analysis Report');

    // Add headers
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 },
      { header: 'Details', key: 'details', width: 30 }
    ];

    // Add summary data
    worksheet.addRow({ metric: 'Period', value: `${startDate} to ${endDate}`, details: 'Report Date Range' });
    worksheet.addRow({ metric: 'Total Sales', value: `$${totalSales.toFixed(2)}`, details: 'All sales in period' });
    worksheet.addRow({ metric: 'Total Orders', value: totalOrders, details: 'Number of orders' });
    worksheet.addRow({ metric: 'Average Order Value', value: `$${averageOrderValue.toFixed(2)}`, details: 'Total Sales / Orders' });

    // Add category breakdown
    worksheet.addRow({ metric: '', value: '', details: '' });
    worksheet.addRow({ metric: 'Category Breakdown', value: '', details: '' });
    categoryData.forEach((cat, index) => {
      worksheet.addRow({ 
        metric: cat._id, 
        value: `$${cat.total.toFixed(2)}`, 
        details: `Category ${index + 1}` 
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=sales-analysis-${startDate}-to-${endDate}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export sales analysis report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exporting sales analysis report'
    });
  }
});

// @route   GET /api/reports/expense-breakdown/export
// @desc    Export expense breakdown report to Excel (Pro plan only)
// @access  Private
router.get('/expense-breakdown/export', proPlanMiddleware, [
  query('startDate').isISO8601(),
  query('endDate').isISO8601()
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
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

    const [expensesData, categoryData] = await Promise.all([
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: filter },
        { 
          $group: { 
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } }
      ])
    ]);

    const totalExpenses = expensesData[0]?.totalExpenses || 0;

    // Generate Excel file
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expense Breakdown Report');

    // Add headers
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 },
      { header: 'Details', key: 'details', width: 30 }
    ];

    // Add summary data
    worksheet.addRow({ metric: 'Period', value: `${startDate} to ${endDate}`, details: 'Report Date Range' });
    worksheet.addRow({ metric: 'Total Expenses', value: `$${totalExpenses.toFixed(2)}`, details: 'All expenses in period' });

    // Add category breakdown
    worksheet.addRow({ metric: '', value: '', details: '' });
    worksheet.addRow({ metric: 'Category Breakdown', value: '', details: '' });
    categoryData.forEach((cat, index) => {
      const percentage = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
      worksheet.addRow({ 
        metric: cat._id, 
        value: `$${cat.total.toFixed(2)}`, 
        details: `${percentage.toFixed(1)}% (${cat.count} expenses)` 
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=expense-breakdown-${startDate}-to-${endDate}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export expense breakdown report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exporting expense breakdown report'
    });
  }
});

// @route   GET /api/reports/export/excel
// @desc    Export report to Excel (Pro plan only)
// @access  Private
router.get('/export/excel', proPlanMiddleware, [
  query('startDate').isISO8601(),
  query('endDate').isISO8601(),
  query('reportType').isIn(['sales', 'expenses', 'profit-loss'])
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
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
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Excel export'
    });
  }
});

export default router;