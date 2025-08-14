import { useState } from 'react'
import { Check, Crown, Zap, Shield, BarChart3, Download, Users, Clock } from 'lucide-react'
import { usePayment } from '../../contexts/PaymentContext'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface PricingPlan {
  id: string
  name: string
  price: string
  priceId: string
  description: string
  features: string[]
  popular?: boolean
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const plans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    priceId: '',
    description: 'Perfect for small businesses getting started',
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    features: [
      'Up to 100 sales records',
      'Up to 50 expense records',
      'Basic reports',
      'Email support',
      'Mobile responsive',
      'Basic analytics'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    priceId: 'price_1OqX2X2X2X2X2X2X2X2X2X2X', // TODO: Replace with your actual Stripe Price ID from dashboard
    description: 'Advanced features for growing businesses',
    icon: Crown,
    color: 'from-purple-500 to-purple-600',
    popular: true,
    features: [
      'Unlimited sales records',
      'Unlimited expense records',
      'Advanced analytics & reports',
      'Excel/PDF exports',
      'Priority support',
      'Real-time notifications',
      'Advanced charts & insights',
      'Custom categories',
      'Data backup & sync',
      'API access'
    ]
  }
]

export default function PricingPlans() {
  const { user } = useAuth()
  const { createCheckoutSession, loading } = usePayment()
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

  const handleUpgrade = async (plan: PricingPlan) => {
    if (plan.id === 'basic') {
      toast.error('Basic plan is free and already active')
      return
    }

    if (user?.plan === 'pro') {
      toast.error('You already have Pro plan')
      return
    }

    if (!plan.priceId) {
      toast.error('Price ID not configured for this plan')
      return
    }

    try {
      setProcessingPlan(plan.id)
      const checkoutUrl = await createCheckoutSession(plan.id as 'basic' | 'pro', plan.priceId)
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      }
    } catch (error) {
      toast.error('Failed to start checkout process')
    } finally {
      setProcessingPlan(null)
    }
  }

  const getCurrentPlan = () => {
    if (user?.plan === 'pro') return 'pro'
    return 'basic'
  }

  return (
    <div className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Choose the Perfect Plan for Your Business
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = getCurrentPlan() === plan.id
            const isPopular = plan.popular
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-8 transition-all duration-200 hover:shadow-lg ${
                  isPopular 
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20' 
                    : 'border-border bg-card'
                } ${isCurrentPlan ? 'ring-2 ring-primary ring-opacity-50' : ''}`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-purple-600 text-white">
                      <Crown className="w-4 h-4 mr-2" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.id === 'pro' && <span className="text-muted-foreground">/month</span>}
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={loading || processingPlan === plan.id || isCurrentPlan}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    isCurrentPlan
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : isPopular
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processingPlan === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : plan.id === 'basic' ? (
                    'Get Started'
                  ) : (
                    'Upgrade to Pro'
                  )}
                </button>

                {/* Additional Info */}
                {plan.id === 'pro' && (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      ✓ 14-day free trial • Cancel anytime • No setup fees
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Feature Comparison
          </h3>
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Basic
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      <div className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                        Sales Records
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-muted-foreground">Up to 100</td>
                    <td className="px-6 py-4 text-center text-sm text-foreground font-semibold">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-green-500" />
                        Expense Records
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-muted-foreground">Up to 50</td>
                    <td className="px-6 py-4 text-center text-sm text-foreground font-semibold">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-2 text-purple-500" />
                        Export Reports
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-muted-foreground">❌</td>
                    <td className="px-6 py-4 text-center text-sm text-foreground font-semibold">✅ Excel/PDF</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-orange-500" />
                        Priority Support
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-muted-foreground">Email</td>
                    <td className="px-6 py-4 text-center text-sm text-foreground font-semibold">Priority</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-red-500" />
                        Real-time Updates
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-muted-foreground">❌</td>
                    <td className="px-6 py-4 text-center text-sm text-foreground font-semibold">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h4 className="font-semibold text-foreground mb-2">Can I cancel my subscription anytime?</h4>
              <p className="text-muted-foreground">
                Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your current billing period.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h4 className="font-semibold text-foreground mb-2">Is there a free trial?</h4>
              <p className="text-muted-foreground">
                Yes! Pro plan comes with a 14-day free trial. No credit card required to start your trial.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h4 className="font-semibold text-foreground mb-2">What happens to my data if I downgrade?</h4>
              <p className="text-muted-foreground">
                Your data is always safe. If you downgrade to Basic, you'll still have access to your data but with the Basic plan limitations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}