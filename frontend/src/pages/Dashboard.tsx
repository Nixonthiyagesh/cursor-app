import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { formatCurrency, formatDate } from '../lib/utils'
import { cn } from '../lib/utils'

interface DashboardStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  totalSales: number
  totalExpenseCount: number
}

interface ChartData {
  date: string
  revenue: number
  expenses: number
}

interface CategoryData {
  name: string
  value: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [topCategories, setTopCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get date range for last 30 days
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const [salesStats, expenseStats, salesAnalysis] = await Promise.all([
        api.get('/sales/stats/summary', {
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        }),
        api.get('/expenses/stats/summary', {
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        }),
        api.get('/reports/sales-analysis', {
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        })
      ])

      const salesData = salesStats.data.data
      const expensesData = expenseStats.data.data
      const analysisData = salesAnalysis.data.data

      // Calculate dashboard stats
      const dashboardStats: DashboardStats = {
        totalRevenue: salesData.totalRevenue || 0,
        totalExpenses: expensesData.totalAmount || 0,
        netProfit: (salesData.totalRevenue || 0) - (expensesData.totalAmount || 0),
        profitMargin: salesData.totalRevenue > 0 
          ? ((salesData.totalRevenue - expensesData.totalAmount) / salesData.totalRevenue) * 100 
          : 0,
        totalSales: salesData.totalSales || 0,
        totalExpenseCount: expensesData.totalExpenses || 0
      }

      setStats(dashboardStats)

      // Prepare chart data
      if (analysisData.dailySales) {
        const chartDataFormatted = analysisData.dailySales.map((item: any) => ({
          date: formatDate(item._id),
          revenue: item.totalRevenue
        }))
        setChartData(chartDataFormatted)
      }

      // Prepare category data
      if (analysisData.categoryBreakdown) {
        const categoryData = analysisData.categoryBreakdown.map((item: any) => ({
          name: item._id,
          value: item.totalRevenue
        }))
        setTopCategories(categoryData)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName}! Here's an overview of your business performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">+12.5%</span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(stats?.totalExpenses || 0)}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-full dark:bg-red-900">
              <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
            <span className="text-red-600">+8.2%</span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
              <p className={cn(
                "text-2xl font-bold",
                (stats?.netProfit || 0) >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(stats?.netProfit || 0)}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-muted-foreground">
              {stats?.profitMargin ? `${stats.profitMargin.toFixed(1)}%` : '0%'} margin
            </span>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold text-foreground">
                {stats?.totalSales || 0}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-900">
              <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">+15.3%</span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0088FE" 
                strokeWidth={2}
                dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">New sale recorded</p>
                <p className="text-sm text-muted-foreground">Product: Premium Widget</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">{formatCurrency(299.99)}</p>
              <p className="text-sm text-muted-foreground">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-full dark:bg-red-900">
                <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">Expense added</p>
                <p className="text-sm text-muted-foreground">Office supplies</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">{formatCurrency(89.50)}</p>
              <p className="text-sm text-muted-foreground">1 day ago</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-foreground">Monthly report generated</p>
                <p className="text-sm text-muted-foreground">December 2024</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}