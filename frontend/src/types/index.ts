// User related types
export interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  businessName: string
  plan: 'basic' | 'pro'
  isActive: boolean
  lastLogin: string
  createdAt: string
  updatedAt: string
}

// Sale related types
export interface Sale {
  _id: string
  customerName: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet' | 'check'
  saleDate: string
  category: string
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateSaleData {
  customerName: string
  productName: string
  quantity: number
  unitPrice: number
  category: string
  paymentMethod?: string
  saleDate: string
  notes?: string
}

export interface UpdateSaleData extends Partial<CreateSaleData> {
  totalAmount?: number
}

// Expense related types
export interface Expense {
  _id: string
  description: string
  amount: number
  category: string
  expenseDate: string
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet' | 'check'
  vendor?: string
  receiptUrl?: string
  isRecurring?: boolean
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  notes?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseData {
  description: string
  amount: number
  category: string
  expenseDate?: string
  paymentMethod?: string
  vendor?: string
  receiptUrl?: string
  isRecurring?: boolean
  recurringInterval?: string
  notes?: string
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: any[]
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Dashboard types
export interface DashboardStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  totalSales: number
  totalExpenseCount: number
}

export interface ChartData {
  date: string
  revenue: number
  expenses: number
}

export interface CategoryData {
  name: string
  value: number
}

// Form types
export interface FormState {
  isSubmitting: boolean
  errors: Record<string, string>
}

// Filter types
export interface SalesFilters {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  category?: string
  customerName?: string
}

export interface ExpenseFilters {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  category?: string
  minAmount?: number
  maxAmount?: number
}