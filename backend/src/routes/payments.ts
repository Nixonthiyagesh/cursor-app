import express from 'express';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';
import { authMiddleware } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// @route   GET /api/payments/test
// @desc    Test endpoint to verify authentication
// @access  Private
router.get('/test', authMiddleware, async (req: any, res: any) => {
  try {
    res.json({
      success: true,
      message: 'Authentication working',
      user: {
        id: req.user._id,
        email: req.user.email,
        plan: req.user.plan
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/create-checkout-session
// @desc    Create Stripe checkout session for subscription
// @access  Private
router.post('/create-checkout-session', [
  body('plan').isIn(['basic', 'pro']),
  body('priceId').notEmpty()
], authMiddleware, async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { plan, priceId } = req.body;
    const userId = req.user._id;

    // Check if user already has an active subscription
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.plan === 'pro' && plan === 'pro') {
      return res.status(400).json({
        success: false,
        message: 'User already has Pro plan'
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/app/profile?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/app/profile?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        plan: plan,
      },
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          plan: plan,
        },
      },
    });

    res.json({
      success: true,
      data: { sessionId: session.id, url: session.url }
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating checkout session'
    });
  }
});

// @route   POST /api/payments/create-portal-session
// @desc    Create Stripe customer portal session for subscription management
// @access  Private
router.post('/create-portal-session', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/app/profile`,
    });

    res.json({
      success: true,
      data: { url: session.url }
    });
  } catch (error) {
    console.error('Create portal session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating portal session'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks for subscription events
// @access  Public (Stripe calls this)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook event handlers
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { userId, plan } = session.metadata!;
  
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Update user with Stripe customer ID and plan
    user.stripeCustomerId = session.customer as string;
    user.plan = plan as 'basic' | 'pro';
    user.subscriptionStatus = 'active';
    user.subscriptionId = session.subscription as string;
    user.planUpdatedAt = new Date();
    
    await user.save();
    
    console.log(`User ${userId} upgraded to ${plan} plan`);
  } catch (error) {
    console.error('Error updating user after checkout:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const { userId, plan } = subscription.metadata;
  
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.plan = plan as 'basic' | 'pro';
    user.subscriptionStatus = subscription.status;
    user.subscriptionId = subscription.id;
    user.planUpdatedAt = new Date();
    
    await user.save();
  } catch (error) {
    console.error('Error updating user after subscription creation:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { userId } = subscription.metadata;
  
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.subscriptionStatus = subscription.status;
    
    if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      user.plan = 'basic'; // Downgrade to basic if payment fails
    }
    
    await user.save();
  } catch (error) {
    console.error('Error updating user after subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { userId } = subscription.metadata;
  
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.plan = 'basic';
    user.subscriptionStatus = 'canceled';
    user.planUpdatedAt = new Date();
    
    await user.save();
  } catch (error) {
    console.error('Error updating user after subscription deletion:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const { userId } = subscription.metadata;
    
    try {
      const user = await User.findById(userId);
      if (!user) return;

      user.subscriptionStatus = 'active';
      user.lastPaymentAt = new Date();
      
      await user.save();
    } catch (error) {
      console.error('Error updating user after successful payment:', error);
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const { userId } = subscription.metadata;
    
    try {
      const user = await User.findById(userId);
      if (!user) return;

      user.subscriptionStatus = 'past_due';
      
      await user.save();
    } catch (error) {
      console.error('Error updating user after failed payment:', error);
    }
  }
}

// @route   GET /api/payments/subscription-status
// @desc    Get current subscription status
// @access  Private
router.get('/subscription-status', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let subscriptionDetails = null;
    
    if (user.stripeCustomerId) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'all',
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          subscriptionDetails = {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            plan: subscription.metadata.plan,
          };
        }
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    res.json({
      success: true,
      data: {
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus || 'active',
        subscriptionDetails,
        planUpdatedAt: user.planUpdatedAt,
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting subscription status'
    });
  }
});

// @route   POST /api/payments/cancel-subscription
// @desc    Cancel subscription at period end
// @access  Private
router.post('/cancel-subscription', authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user || !user.subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel subscription at period end
    await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error canceling subscription'
    });
  }
});

export default router;