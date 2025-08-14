import { useState, useEffect } from 'react'
import { Download, Calendar, TrendingUp, BarChart3, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import toast from 'react-hot-toast'

interface ReportData {
  period: { startDate: string; endDate: string }
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: string
  currency: string
}

interface SalesAnalysisData {
  period: { startDate: string; endDate: string }
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topCategories: Array<{ category: string; total: number }>
  dailySales: Array<{ date: string; total: number }>
}

interface ExpenseBreakdownData {
  period: { startDate: string; endDate: string }
  totalExpenses: number
  categoryBreakdown: Array<{ category: string; total: number; percentage: number }>
  monthlyTrend: Array<{ month: string; total: number }>
}

export default function Reports() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState('30')
  const [loading, setLoading] = useState(false)
  const [profitLossData, setProfitLossData] = useState<ReportData | null>(null)
  const [salesAnalysisData, setSalesAnalysisData] = useState<SalesAnalysisData | null>(null)
  const [expenseBreakdownData, setExpenseBreakdownData] = useState<ExpenseBreakdownData | null>(null)

  const getDateRange = () => {
    const endDate = new Date()
    const startDate = new Date()
    
    switch (dateRange) {
      case '7':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '365':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  const generateProfitLossReport = async () => {
    try {
      setLoading(true)
      const { startDate, endDate } = getDateRange()
      
      const response = await api.get(`/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`)
      setProfitLossData(response.data.data)
      toast.success('Profit & Loss report generated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate Profit & Loss report')
    } finally {
      setLoading(false)
    }
  }

  const generateSalesAnalysisReport = async () => {
    try {
      setLoading(true)
      const { startDate, endDate } = getDateRange()
      
      const response = await api.get(`/reports/sales-analysis?startDate=${startDate}&endDate=${endDate}`)
      setSalesAnalysisData(response.data.data)
      toast.success('Sales Analysis report generated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate Sales Analysis report')
    } finally {
      setLoading(false)
    }
  }

  const generateExpenseBreakdownReport = async () => {
    try {
      setLoading(true)
      const { startDate, endDate } = getDateRange()
      
      const response = await api.get(`/reports/expense-breakdown?startDate=${startDate}&endDate=${endDate}`)
      setExpenseBreakdownData(response.data.data)
      toast.success('Expense Breakdown report generated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate Expense Breakdown report')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (reportType: string) => {
    try {
      const { startDate, endDate } = getDateRange()
      
      if (user?.plan === 'basic') {
        toast.error('Export functionality requires Pro plan')
        return
      }
      
      const response = await api.get(`/reports/${reportType}/export?startDate=${startDate}&endDate=${endDate}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${reportType}-${startDate}-to-${endDate}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Report downloaded successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download report')
    }
  }

  const formatDateRange = () => {
    const { startDate, endDate } = getDateRange()
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Generate comprehensive business reports and insights
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <label className="text-sm font-medium text-foreground">Date Range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-input bg-background text-foreground rounded-md"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <span className="text-sm text-muted-foreground">
            {formatDateRange()}
          </span>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profit & Loss */}
        <div className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            {user?.plan === 'pro' && (
              <button 
                onClick={() => downloadReport('profit-loss')}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="Download Report"
              >
                <Download className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Profit & Loss</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comprehensive overview of revenue, expenses, and profitability
          </p>
          
          {profitLossData && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Revenue:</span>
                  <div className="font-semibold text-green-600">{formatCurrency(profitLossData.totalRevenue)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Expenses:</span>
                  <div className="font-semibold text-red-600">{formatCurrency(profitLossData.totalExpenses)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Net Profit:</span>
                  <div className={`font-semibold ${profitLossData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(profitLossData.netProfit)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Margin:</span>
                  <div className="font-semibold">{profitLossData.profitMargin}%</div>
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={generateProfitLossReport}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {profitLossData ? 'Refresh Report' : 'Generate Report'}
          </button>
        </div>

        {/* Sales Analysis */}
        <div className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            {user?.plan === 'pro' && (
              <button 
                onClick={() => downloadReport('sales-analysis')}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="Download Report"
              >
                <Download className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Sales Analysis</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Detailed breakdown of sales performance and trends
          </p>
          
          {salesAnalysisData && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Sales:</span>
                  <div className="font-semibold text-blue-600">{formatCurrency(salesAnalysisData.totalSales)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Orders:</span>
                  <div className="font-semibold">{salesAnalysisData.totalOrders}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Order:</span>
                  <div className="font-semibold">{formatCurrency(salesAnalysisData.averageOrderValue)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Top Category:</span>
                  <div className="font-semibold">{salesAnalysisData.topCategories[0]?.category || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={generateSalesAnalysisReport}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {salesAnalysisData ? 'Refresh Report' : 'Generate Report'}
          </button>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-full dark:bg-red-900">
              <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            {user?.plan === 'pro' && (
              <button 
                onClick={() => downloadReport('expense-breakdown')}
                className="p-2 hover:bg-accent rounded-md transition-colors"
                title="Download Report"
              >
                <Download className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Expense Breakdown</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Categorized expense analysis and spending patterns
          </p>
          
          {expenseBreakdownData && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Expenses:</span>
                  <div className="font-semibold text-red-600">{formatCurrency(expenseBreakdownData.totalExpenses)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Top Category:</span>
                  <div className="font-semibold">
                    {expenseBreakdownData.categoryBreakdown[0]?.category || 'N/A'} 
                    ({expenseBreakdownData.categoryBreakdown[0]?.percentage?.toFixed(1) || 0}%)
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <button 
            onClick={generateExpenseBreakdownReport}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {expenseBreakdownData ? 'Refresh Report' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Pro Plan Features */}
      {user?.plan === 'basic' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-900">
              <Download className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Upgrade to Pro for Advanced Reports
              </h3>
              <p className="text-muted-foreground mb-4">
                Get access to Excel/PDF exports, advanced analytics, and custom report scheduling.
              </p>
              <button className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div className="bg-card rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-foreground">Recent Reports</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {profitLossData && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Profit & Loss Report</p>
                  <p className="text-sm text-muted-foreground">{formatDateRange()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Generated just now</span>
                  {user?.plan === 'pro' && (
                    <button 
                      onClick={() => downloadReport('profit-loss')}
                      className="p-2 hover:bg-accent rounded-md transition-colors"
                    >
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {salesAnalysisData && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Sales Analysis Report</p>
                  <p className="text-sm text-muted-foreground">{formatDateRange()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Generated just now</span>
                  {user?.plan === 'pro' && (
                    <button 
                      onClick={() => downloadReport('sales-analysis')}
                      className="p-2 hover:bg-accent rounded-md transition-colors"
                    >
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {expenseBreakdownData && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Expense Breakdown Report</p>
                  <p className="text-sm text-muted-foreground">{formatDateRange()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Generated just now</span>
                  {user?.plan === 'pro' && (
                    <button 
                      onClick={() => downloadReport('expense-breakdown')}
                      className="p-2 hover:bg-accent rounded-md transition-colors"
                    >
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {!profitLossData && !salesAnalysisData && !expenseBreakdownData && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reports generated yet. Generate your first report above.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}