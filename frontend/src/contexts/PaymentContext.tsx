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
  error: string | null
  testAuth: () => Promise<boolean>
  createCheckoutSession: (plan: 'basic' | 'pro', priceId: string) => Promise<string | null>
  createPortalSession: () => Promise<string | null>
  cancelSubscription: () => Promise<boolean>
  refreshSubscriptionStatus: () => Promise<void>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      refreshSubscriptionStatus()
      setIsInitialized(true)
    }
  }, [isInitialized])

  const testAuth = async (): Promise<boolean> => {
    try {
      const response = await api.get('/payments/test')
      console.log('Auth test successful:', response.data)
      return true
    } catch (error: any) {
      console.error('Auth test failed:', error.response?.data || error.message)
      return false
    }
  }

  const refreshSubscriptionStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First test authentication
      const authWorking = await testAuth()
      if (!authWorking) {
        setError('Authentication failed. Please check your login status.')
        setRetryCount(0)
        return
      }
      
      const response = await api.get('/payments/subscription-status')
      
      if (response.data.success) {
        setSubscriptionStatus(response.data.data)
        setRetryCount(0) // Reset retry count on success
      } else {
        setError('Failed to fetch subscription status')
      }
    } catch (error: any) {
      console.error('Error fetching subscription status:', error)
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        setError('Authentication required. Please log in again.')
        setRetryCount(0) // Don't retry auth errors
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.')
        setRetryCount(0) // Don't retry server errors
      } else if (retryCount < 2) { // Reduced retry count to prevent infinite loops
        // Retry network errors up to 2 times
        setRetryCount(prev => prev + 1)
        setTimeout(() => {
          refreshSubscriptionStatus()
        }, 3000) // Fixed delay instead of exponential backoff
      } else {
        setError('Failed to load subscription status after multiple attempts')
        setRetryCount(0)
      }
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
    error,
    testAuth,
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