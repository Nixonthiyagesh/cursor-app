import { useState } from 'react'
import { Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Reports() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState('30')

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
            <button className="p-2 hover:bg-accent rounded-md transition-colors">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Profit & Loss</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comprehensive overview of revenue, expenses, and profitability
          </p>
          <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
            Generate Report
          </button>
        </div>

        {/* Sales Analysis */}
        <div className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <button className="p-2 hover:bg-accent rounded-md transition-colors">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Sales Analysis</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Detailed breakdown of sales performance and trends
          </p>
          <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
            Generate Report
          </button>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-full dark:bg-red-900">
              <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <button className="p-2 hover:bg-accent rounded-md transition-colors">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Expense Breakdown</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Categorized expense analysis and spending patterns
          </p>
          <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
            Generate Report
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
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Profit & Loss Report</p>
                <p className="text-sm text-muted-foreground">December 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Generated 2 days ago</span>
                <button className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-foreground">Sales Analysis Report</p>
                <p className="text-sm text-muted-foreground">Q4 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Generated 1 week ago</span>
                <button className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}