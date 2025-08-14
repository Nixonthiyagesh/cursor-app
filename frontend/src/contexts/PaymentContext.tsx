import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

interface SubscriptionDetails {
  id: string
  status: string
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
  plan: string
}

interface SubscriptionStatus {
  plan: 'basic' | 'pro'
  subscriptionStatus: string
  subscriptionDetails: SubscriptionDetails | null
  planUpdatedAt: string | null
}

interface PaymentContextType {
  subscriptionStatus: SubscriptionStatus | null
  loading: boolean
  createCheckoutSession: (plan: 'basic' | 'pro', priceId: string) => Promise<string | null>
  createPortalSession: () => Promise<string | null>
  cancelSubscription: () => Promise<boolean>
  refreshSubscriptionStatus: () => Promise<void>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshSubscriptionStatus()
  }, [])

  const refreshSubscriptionStatus = async () => {
    try {
      setLoading(true)
      const response = await api.get('/payments/subscription-status')
      setSubscriptionStatus(response.data.data)
    } catch (error: any) {
      console.error('Error fetching subscription status:', error)
      // Don't show error toast for this as it's called on mount
    } finally {
      setLoading(false)
    }
  }

  const createCheckoutSession = async (plan: 'basic' | 'pro', priceId: string): Promise<string | null> => {
    try {
      const response = await api.post('/payments/create-checkout-session', {
        plan,
        priceId
      })
      
      if (response.data.success) {
        return response.data.data.url
      }
      
      toast.error('Failed to create checkout session')
      return null
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create checkout session'
      toast.error(message)
      return null
    }
  }

  const createPortalSession = async (): Promise<string | null> => {
    try {
      const response = await api.post('/payments/create-portal-session')
      
      if (response.data.success) {
        return response.data.data.url
      }
      
      toast.error('Failed to create portal session')
      return null
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create portal session'
      toast.error(message)
      return null
    }
  }

  const cancelSubscription = async (): Promise<boolean> => {
    try {
      const response = await api.post('/payments/cancel-subscription')
      
      if (response.data.success) {
        toast.success('Subscription will be canceled at the end of the current period')
        await refreshSubscriptionStatus()
        return true
      }
      
      toast.error('Failed to cancel subscription')
      return false
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel subscription'
      toast.error(message)
      return false
    }
  }

  const value: PaymentContextType = {
    subscriptionStatus,
    loading,
    createCheckoutSession,
    createPortalSession,
    cancelSubscription,
    refreshSubscriptionStatus
  }

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}