import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '../lib/utils'
import { Sale, CreateSaleData, UpdateSaleData } from '../types'

// Default sale object for form initialization
const defaultSale: CreateSaleData = {
  customerName: '',
  productName: '',
  quantity: 0,
  unitPrice: 0,
  saleDate: new Date().toISOString().split('T')[0],
  category: '',
  notes: '',
  paymentMethod: 'cash'
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [formData, setFormData] = useState<CreateSaleData>(defaultSale)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const response = await api.get('/sales')
      setSales(response.data.data.sales)
    } catch (error) {
      toast.error('Failed to fetch sales')
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setFormData(defaultSale)
    setEditingSale(null)
    setShowAddForm(false)
  }

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale)
    setFormData({
      customerName: sale.customerName,
      productName: sale.productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      saleDate: sale.saleDate,
      category: sale.category,
      notes: sale.notes || '',
      paymentMethod: sale.paymentMethod || 'cash'
    })
    setShowAddForm(true)
  }

  const handleAddSale = async () => {
    try {
      setIsSubmitting(true)
      
      // Validate required fields
      if (!formData.customerName || !formData.productName || !formData.category) {
        toast.error('Please fill in all required fields')
        return
      }

      if (formData.quantity <= 0 || formData.unitPrice <= 0) {
        toast.error('Quantity and unit price must be greater than 0')
        return
      }

      const payload = {
        ...formData,
        totalAmount: formData.quantity * formData.unitPrice,
      }

      if (editingSale?._id) {
        // Update existing sale
        await api.put(`/sales/${editingSale._id}`, payload)
        toast.success('Sale updated successfully')
      } else {
        // Add new sale
        await api.post('/sales', payload)
        toast.success('Sale added successfully')
      }

      resetForm()
      fetchSales()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save sale'
      toast.error(message)
      console.error('Error saving sale:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale?')) {
      return
    }

    try {
      await api.delete(`/sales/${id}`)
      toast.success('Sale deleted successfully')
      fetchSales()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete sale'
      toast.error(message)
      console.error('Error deleting sale:', error)
    }
  }

  const handleInputChange = (field: keyof CreateSaleData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales</h1>
          <p className="text-muted-foreground">Manage your sales transactions</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingSale(null)
            setFormData(defaultSale)
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Sale
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search sales by customer, product, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
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
              {filteredSales.map((sale) => (
                <tr key={sale._id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{sale.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{sale.productName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{sale.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{formatCurrency(sale.unitPrice)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">{formatCurrency(sale.totalAmount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {sale.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{formatDate(sale.saleDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSale(sale)}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Edit sale"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale._id)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                        title="Delete sale"
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
        
        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No sales found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Sale Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSale ? 'Edit Sale' : 'Add New Sale'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {editingSale ? 'Update sale information' : 'Enter sale details'}
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddSale(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="Customer Name"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="Product Name"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Unit Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Unit Price"
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Category *
                </label>
                <select 
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food</option>
                  <option value="services">Services</option>
                  <option value="home">Home & Garden</option>
                  <option value="automotive">Automotive</option>
                  <option value="health">Health & Beauty</option>
                  <option value="sports">Sports & Recreation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Payment Method
                </label>
                <select 
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="digital_wallet">Digital Wallet</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Sale Date *
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.saleDate}
                  onChange={(e) => handleInputChange('saleDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Notes
                </label>
                <textarea
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (editingSale ? 'Update' : 'Add') + ' Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}