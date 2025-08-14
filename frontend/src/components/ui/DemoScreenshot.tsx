import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  PieChart,
  Activity,
  Target
} from 'lucide-react'

export default function DemoScreenshot() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sales' | 'reports'>('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: PieChart }
  ]

  const renderDashboardContent = () => (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Revenue</p>
              <p className="text-2xl font-bold">$124,563</p>
            </div>
            <TrendingUp className="w-6 h-6 opacity-80" />
          </div>
          <div className="mt-2 text-xs opacity-80">+12.5% from last month</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Sales</p>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <Target className="w-6 h-6 opacity-80" />
          </div>
          <div className="mt-2 text-xs opacity-80">+8.2% from last month</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Customers</p>
              <p className="text-2xl font-bold">892</p>
            </div>
            <Users className="w-6 h-6 opacity-80" />
          </div>
          <div className="mt-2 text-xs opacity-80">+15.3% from last month</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Profit Margin</p>
              <p className="text-2xl font-bold">23.4%</p>
            </div>
            <Activity className="w-6 h-6 opacity-80" />
          </div>
          <div className="mt-2 text-xs opacity-80">+2.1% from last month</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Interactive Chart</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Pie Chart</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { type: 'sale', message: 'New sale recorded - $2,450', time: '2 hours ago' },
            { type: 'expense', message: 'Office supplies expense - $89.50', time: '4 hours ago' },
            { type: 'customer', message: 'New customer registered', time: '6 hours ago' },
            { type: 'report', message: 'Monthly report generated', time: '1 day ago' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'sale' ? 'bg-green-500' :
                activity.type === 'expense' ? 'bg-red-500' :
                activity.type === 'customer' ? 'bg-blue-500' : 'bg-purple-500'
              }`} />
              <span className="text-sm text-gray-700 flex-1">{activity.message}</span>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSalesContent = () => (
    <div className="space-y-4">
      {/* Sales Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { customer: 'John Smith', product: 'Premium Widget', amount: '$299.99', date: 'Today' },
                { customer: 'Sarah Johnson', product: 'Basic Package', amount: '$149.50', date: 'Yesterday' },
                { customer: 'Mike Wilson', product: 'Enterprise Solution', amount: '$1,299.00', date: '2 days ago' },
                { customer: 'Emily Davis', product: 'Starter Kit', amount: '$79.99', date: '3 days ago' }
              ].map((sale, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sale.customer}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{sale.product}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">{sale.amount}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{sale.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderReportsContent = () => (
    <div className="space-y-4">
      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit & Loss</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Revenue</span>
              <span className="text-sm font-medium text-green-600">$124,563</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Expenses</span>
              <span className="text-sm font-medium text-red-600">$95,420</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Net Profit</span>
                <span className="text-sm font-bold text-green-600">$29,143</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {[
              { category: 'Electronics', revenue: '$45,230', percentage: '36%' },
              { category: 'Services', revenue: '$32,150', percentage: '26%' },
              { category: 'Software', revenue: '$28,940', percentage: '23%' },
              { category: 'Consulting', revenue: '$18,243', percentage: '15%' }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{item.category}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{item.revenue}</span>
                  <span className="text-xs text-gray-500">({item.percentage})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-gray-100 rounded-2xl p-6 shadow-2xl border border-gray-200">
      {/* Browser Header */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex-1 bg-gray-200 rounded-lg px-3 py-1 ml-4">
          <span className="text-xs text-gray-600">bizlytic.com/app</span>
        </div>
      </div>

      {/* App Header */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Bizlytic</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Dec 2024</span>
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg p-2 mb-4 border border-gray-200">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        {activeTab === 'dashboard' && renderDashboardContent()}
        {activeTab === 'sales' && renderSalesContent()}
        {activeTab === 'reports' && renderReportsContent()}
      </div>
    </div>
  )
}