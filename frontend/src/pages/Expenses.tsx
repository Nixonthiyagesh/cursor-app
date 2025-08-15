import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit, Trash2, X } from 'lucide-react'
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

interface CreateExpenseData {
  description: string
  amount: number
  category: string
  expenseDate: string
  paymentMethod: string
  vendor?: string
  isRecurring: boolean
}

interface UpdateExpenseData extends Partial<CreateExpenseData> {}

const defaultExpense: CreateExpenseData = {
  description: '',
  amount: 0,
  category: '',
  expenseDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'card',
  vendor: '',
  isRecurring: false
}

const categories = [
  'Office Supplies',
  'Marketing',
  'Utilities',
  'Rent',
  'Travel',
  'Equipment',
  'Software',
  'Insurance',
  'Legal',
  'Other'
]

const paymentMethods = [
  'cash',
  'card',
  'transfer',
  'other'
]

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState<CreateExpenseData>(defaultExpense)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const response = await api.get('/expenses')
      setExpenses(response.data.data.expenses)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }

    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0'
    }

    if (!formData.category) {
      errors.category = 'Category is required'
    }

    if (!formData.expenseDate) {
      errors.expenseDate = 'Date is required'
    }

    if (!formData.paymentMethod) {
      errors.paymentMethod = 'Payment method is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      
      if (editingExpense) {
        // Update existing expense
        const response = await api.put(`/expenses/${editingExpense._id}`, formData)
        setExpenses(prev => prev.map(exp => 
          exp._id === editingExpense._id ? response.data.data.expense : exp
        ))
        toast.success('Expense updated successfully')
      } else {
        // Create new expense
        const response = await api.post('/expenses', formData)
        setExpenses(prev => [response.data.data.expense, ...prev])
        toast.success('Expense added successfully')
      }
      
      handleCloseForm()
      fetchExpenses() // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save expense')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expenseDate: expense.expenseDate.split('T')[0],
      paymentMethod: expense.paymentMethod,
      vendor: expense.vendor || '',
      isRecurring: expense.isRecurring
    })
    setShowAddForm(true)
  }

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      await api.delete(`/expenses/${expenseId}`)
      setExpenses(prev => prev.filter(exp => exp._id !== expenseId))
      toast.success('Expense deleted successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete expense')
    }
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    setEditingExpense(null)
    setFormData(defaultExpense)
    setFormErrors({})
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
                      <button 
                        onClick={() => handleEdit(expense)}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(expense._id)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
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

      {/* Add/Edit Expense Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.description ? 'border-destructive' : 'border-input'
                  } bg-background text-foreground`}
                  placeholder="Enter expense description"
                />
                {formErrors.description && (
                  <p className="text-sm text-destructive mt-1">{formErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.amount ? 'border-destructive' : 'border-input'
                  } bg-background text-foreground`}
                  placeholder="0.00"
                />
                {formErrors.amount && (
                  <p className="text-sm text-destructive mt-1">{formErrors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.category ? 'border-destructive' : 'border-input'
                  } bg-background text-foreground`}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="text-sm text-destructive mt-1">{formErrors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.expenseDate ? 'border-destructive' : 'border-input'
                  } bg-background text-foreground`}
                />
                {formErrors.expenseDate && (
                  <p className="text-sm text-destructive mt-1">{formErrors.expenseDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.paymentMethod ? 'border-destructive' : 'border-input'
                  } bg-background text-foreground`}
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </option>
                  ))}
                </select>
                {formErrors.paymentMethod && (
                  <p className="text-sm text-destructive mt-1">{formErrors.paymentMethod}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Vendor (optional)
                </label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange('vendor', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isRecurring" className="ml-2 block text-sm text-foreground">
                  Recurring expense
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Add Expense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}