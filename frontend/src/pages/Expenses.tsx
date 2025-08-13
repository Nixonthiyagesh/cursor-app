import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import toast from 'react-hot-toast'

interface Expense {
  _id: string
  description: string
  amount: number
  category: string
  expenseDate: string
  paymentMethod: string
  vendor?: string
  isRecurring: boolean
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const response = await api.get('/expenses')
      setExpenses(response.data.data.expenses)
    } catch (error) {
      toast.error('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">Track your business expenses</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search expenses by description, category, or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredExpenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-foreground">{expense.description}</div>
                    {expense.isRecurring && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Recurring
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{formatCurrency(expense.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{expense.vendor || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{formatDate(expense.expenseDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-primary hover:text-primary/80 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-destructive hover:text-destructive/80 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No expenses found</p>
          </div>
        )}
      </div>

      {/* Add Expense Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
            <p className="text-muted-foreground mb-4">Enter expense details</p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Description"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
              />
              <select className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md">
                <option value="">Select Category</option>
                <option value="office">Office Supplies</option>
                <option value="marketing">Marketing</option>
                <option value="utilities">Utilities</option>
                <option value="rent">Rent</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Vendor (optional)"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}