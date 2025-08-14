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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Temporarily disable API calls to prevent infinite loops
  useEffect(() => {
    // Set a mock subscription status for now
    setSubscriptionStatus({
      plan: 'basic',
      subscriptionStatus: 'active',
      subscriptionDetails: null,
      planUpdatedAt: null
    })
  }, [])

  const testAuth = async (): Promise<boolean> => {
    // Temporarily return true to prevent errors
    return true
  }

  const refreshSubscriptionStatus = async () => {
    // Temporarily do nothing to prevent infinite loops
    console.log('Payment context temporarily disabled - backend not running')
  }

  const createCheckoutSession = async (plan: 'basic' | 'pro', priceId: string): Promise<string | null> => {
    toast.error('Payment system temporarily unavailable - backend not running')
    return null
  }

  const createPortalSession = async (): Promise<string | null> => {
    toast.error('Payment system temporarily unavailable - backend not running')
    return null
  }

  const cancelSubscription = async (): Promise<boolean> => {
    toast.error('Payment system temporarily unavailable - backend not running')
    return false
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