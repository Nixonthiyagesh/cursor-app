import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usePayment } from '../contexts/PaymentContext'
import { User, Building, Mail, Crown, Shield, Settings, CreditCard, Calendar, AlertCircle } from 'lucide-react'
import { formatDate } from '../lib/utils'
import toast from 'react-hot-toast'
import PricingPlans from '../components/ui/PricingPlans'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { subscriptionStatus, createPortalSession, cancelSubscription, loading } = usePayment()
  const [isEditing, setIsEditing] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    businessName: user?.businessName || '',
    email: user?.email || ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        businessName: user.businessName || '',
        email: user.email || ''
      })
    }
  }, [user])

  const handleSave = async () => {
    try {
      // In a real app, you'd call the API to update the user
      updateUser(formData)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      businessName: user?.businessName || '',
      email: user.email || ''
    })
    setIsEditing(false)
  }

  const handleManageSubscription = async () => {
    try {
      const portalUrl = await createPortalSession()
      if (portalUrl) {
        window.location.href = portalUrl
      }
    } catch (error) {
      toast.error('Failed to open subscription management')
    }
  }

  const handleCancelSubscription = async () => {
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your current billing period.')) {
      const success = await cancelSubscription()
      if (success) {
        toast.success('Subscription will be canceled at the end of the current period')
      }
    }
  }

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'canceled':
        return 'text-red-600'
      case 'past_due':
        return 'text-yellow-600'
      case 'unpaid':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const getSubscriptionStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'canceled':
        return 'Canceled'
      case 'past_due':
        return 'Past Due'
      case 'unpaid':
        return 'Unpaid'
      default:
        return status
    }
  }

  if (showPricing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pricing Plans</h1>
            <p className="text-muted-foreground">Choose the perfect plan for your business</p>
          </div>
          <button
            onClick={() => setShowPricing(false)}
            className="px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors"
          >
            Back to Profile
          </button>
        </div>
        <PricingPlans />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      First Name
                    </label>
                    <p className="text-foreground">{user?.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Last Name
                    </label>
                    <p className="text-foreground">{user?.lastName}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Business Name
                  </label>
                  <p className="text-foreground">{user?.businessName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </label>
                  <p className="text-foreground">{user?.email}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-input bg-muted text-muted-foreground rounded-md cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Subscription Management */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Subscription Management</h2>
            <div className="space-y-4">
              {subscriptionStatus ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-foreground">Current Plan</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {subscriptionStatus.plan} Plan
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${getSubscriptionStatusColor(subscriptionStatus.subscriptionStatus)}`}>
                        {getSubscriptionStatusText(subscriptionStatus.subscriptionStatus)}
                      </p>
                      {subscriptionStatus.planUpdatedAt && (
                        <p className="text-sm text-muted-foreground">
                          Updated {formatDate(subscriptionStatus.planUpdatedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {subscriptionStatus.subscriptionDetails && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Subscription Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <p className="font-medium">{subscriptionStatus.subscriptionDetails.status}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Next Billing:</span>
                          <p className="font-medium">
                            {formatDate(new Date(subscriptionStatus.subscriptionDetails.currentPeriodEnd * 1000))}
                          </p>
                        </div>
                        {subscriptionStatus.subscriptionDetails.cancelAtPeriodEnd && (
                          <div className="col-span-2">
                            <div className="flex items-center gap-2 text-yellow-600">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Subscription will be canceled at the end of the current period
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleManageSubscription}
                      disabled={loading}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      Manage Subscription
                    </button>
                    {subscriptionStatus.plan === 'pro' && (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={loading}
                        className="px-4 py-2 border border-destructive text-destructive rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading subscription details...</p>
                </div>
              )}
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Account Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                </div>
                <button className="px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors">
                  Change
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <button className="px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-accent transition-colors">
                  Enable
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Account Status</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Plan</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground capitalize">{user?.plan}</span>
                    {user?.plan === 'pro' && <Crown className="h-4 w-4 text-yellow-500" />}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full dark:bg-green-900">
                  <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Business</p>
                  <p className="text-sm text-muted-foreground">{user?.businessName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-900">
                  <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Upgrade */}
          {user?.plan === 'basic' && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <div className="text-center">
                <Crown className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Upgrade to Pro
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get access to advanced features, cloud sync, and priority support.
                </p>
                <button 
                  onClick={() => setShowPricing(true)}
                  className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                >
                  View Plans
                </button>
              </div>
            </div>
          )}

          {/* Account Statistics */}
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Account Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="text-sm font-medium text-foreground">
                  {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last login</span>
                <span className="text-sm font-medium text-foreground">
                  {user?.lastLogin ? formatDate(user.lastLogin) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium text-green-600">
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}