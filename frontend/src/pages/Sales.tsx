import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import toast from 'react-hot-toast'

interface Sale {
  _id: string
  customerName: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  paymentMethod?: string
  saleDate: string
  category: string
  notes?: string
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>({_id: '', customerName: '',
  productName: '',
  quantity: 0,
  unitPrice: 0,
  totalAmount: 0,
  saleDate: new Date().toISOString().split('T')[0],
  category: '',
  notes: '',
  paymentMethod: 'cash'
})

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
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleAddSale = async () => {
    try {   
      if (editingSale?._id) {
        const payload = {
          ...editingSale,
          totalAmount: editingSale.quantity * editingSale.unitPrice,  
        }

        // Update existing sale
        await api.put(`/sales/${editingSale._id}`, payload)
        toast.success('Sale updated successfully')
      } else {
        // Add new sale
        const payload = {...editingSale };
        delete payload._id;
        await api.post('/sales', payload)
        toast.success('Sale added successfully')
      }

      setShowAddForm(false);
      setEditingSale({_id: '', customerName: '',
  productName: '',
  quantity: 0,
  unitPrice: 0,
  totalAmount: 0,
  saleDate: new Date().toISOString().split('T')[0],
  category: '',
  notes: '',
  paymentMethod: 'cash'
});
      fetchSales();
    } catch (error) {
      toast.error('Failed to save sale')
    }
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
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Sale
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sales by customer, product, or category..."
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
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {sale.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-foreground">{formatDate(sale.saleDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSale(sale)}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale._id)}
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
        
        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No sales found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Sale Form Modal */}
      {(showAddForm || editingSale?._id) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingSale?._id ? 'Edit Sale' : 'Add New Sale'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {editingSale?._id ? 'Update sale information' : 'Enter sale details'}
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Customer Name"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
                value={editingSale?.customerName}
                onChange={(e) => setEditingSale((prevState) => prevState ? { ...prevState, customerName: e.target.value || '' } : null)}  
              />
              <input
                type="text"
                placeholder="Product Name"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
                value={editingSale?.productName}
                onChange={(e) => setEditingSale((prevState) => prevState ? { ...prevState, productName: e.target.value || '' } : null)}   
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Quantity"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
                  value={ editingSale?.quantity }
                  onChange={(e) => setEditingSale((prevState) => prevState ? { ...prevState, quantity: parseInt(e.target.value) || 0 } : null)} 
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Unit Price"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
                  value={editingSale?.unitPrice}
                  onChange={(e) => setEditingSale((prevState) => prevState ? { ...prevState, unitPrice: parseFloat(e.target.value) || 0 } : null)}  
                />
              </div>
              <select className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md"
                value={editingSale?.category }
                onChange={(e) => setEditingSale((prevState) => prevState ? { ...prevState, category: e.target.value || '' } : null)}  >
                <option value="">Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="food">Food</option>
                <option value="services">Services</option>
              </select>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingSale(null)
                }}
                className="flex-1 px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleAddSale} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                {editingSale ? 'Update' : 'Add'} Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function handleDeleteSale(id: string) {
  // Implementation for deleting a sale
  console.log('Delete sale:', id)
}