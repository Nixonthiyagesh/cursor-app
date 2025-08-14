# 🚀 **Bizlytic MVP Setup Guide**

## **Overview**
This guide will help you set up Bizlytic as your first MVP with a complete Stripe payment system, working functionality, and production-ready features.

---

## **🔧 Phase 1: Environment Setup**

### **1. Backend Environment (.env)**
Create `backend/.env` with your actual values:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bizlytic

# Frontend URL
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Stripe Configuration (Get these from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret

# Email Configuration (Optional for now)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@bizlytic.com
```

### **2. Frontend Environment (.env)**
Create `frontend/.env` with your actual values:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Bizlytic
VITE_APP_VERSION=1.0.0

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key
```

---

## **💳 Phase 2: Stripe Setup**

### **1. Create Stripe Account**
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete your business profile
3. Switch to test mode for development

### **2. Get API Keys**
1. In Stripe Dashboard → Developers → API keys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### **3. Create Product & Price**
1. Go to Products → Add Product
2. Create a product called "Bizlytic Pro"
3. Set price to $29/month
4. Copy the **Price ID** (starts with `price_`)

### **4. Update Price ID**
In `frontend/src/components/ui/PricingPlans.tsx`, replace:
```typescript
priceId: 'price_1OqX2X2X2X2X2X2X2X2X2X2X', // Replace with your actual Stripe price ID
```

### **5. Set Up Webhooks**
1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `http://localhost:5000/api/payments/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Webhook signing secret** (starts with `whsec_`)

---

## **📦 Phase 3: Install Dependencies**

### **Backend Dependencies**
```bash
cd backend
npm install
```

### **Frontend Dependencies**
```bash
cd frontend
npm install
```

---

## **🗄️ Phase 4: Database Setup**

### **1. Install MongoDB**
- **Windows**: Download from [mongodb.com](https://mongodb.com)
- **Mac**: `brew install mongodb-community`
- **Linux**: `sudo apt install mongodb`

### **2. Start MongoDB**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or start manually
mongod
```

### **3. Create Database**
```bash
# Connect to MongoDB
mongosh

# Create database
use bizlytic

# Exit
exit
```

---

## **🚀 Phase 5: Start the Application**

### **1. Start Backend**
```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Connected to MongoDB
🚀 Bizlytic backend server running on port 5000
📊 Environment: development
🔗 Health check: http://localhost:5000/api/health
💳 Stripe integration: Enabled
```

### **2. Start Frontend**
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v4.1.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## **🧪 Phase 6: Test All Functionality**

### **1. Test Authentication**
- ✅ Register new account
- ✅ Login with credentials
- ✅ Verify redirect to dashboard

### **2. Test Core Features**
- ✅ **Dashboard**: View stats and charts
- ✅ **Sales**: Add, edit, delete sales records
- ✅ **Expenses**: Add, edit, delete expenses
- ✅ **Reports**: Generate real reports
- ✅ **Calendar**: Create and manage events

### **3. Test Payment System**
- ✅ View pricing plans
- ✅ Start checkout process
- ✅ Complete payment (use test card: 4242 4242 4242 4242)
- ✅ Verify plan upgrade
- ✅ Manage subscription

---

## **🔍 Phase 7: Troubleshooting**

### **Common Issues & Solutions**

#### **1. MongoDB Connection Failed**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo journalctl -u mongod
```

#### **2. Stripe Integration Not Working**
- Verify API keys are correct
- Check webhook endpoint is accessible
- Ensure price ID is updated in PricingPlans.tsx
- Check Stripe dashboard for errors

#### **3. Frontend Not Loading**
- Check if backend is running on port 5000
- Verify VITE_API_BASE_URL in frontend .env
- Check browser console for errors

#### **4. Payment Processing Issues**
- Use Stripe test cards only
- Check Stripe dashboard for failed payments
- Verify webhook secret is correct

---

## **📱 Phase 8: Production Deployment**

### **1. Environment Variables**
Update all environment files with production values:
- Use production Stripe keys
- Set production MongoDB URI
- Configure production frontend URL

### **2. Build Frontend**
```bash
cd frontend
npm run build
```

### **3. Deploy Backend**
```bash
cd backend
npm run build
npm start
```

### **4. Set Up Production Webhook**
- Update webhook endpoint to production URL
- Use production Stripe keys
- Test webhook delivery

---

## **🎯 Phase 9: MVP Features Checklist**

### **✅ Core Business Features**
- [x] User authentication & registration
- [x] Sales management (CRUD)
- [x] Expense tracking (CRUD)
- [x] Financial reporting
- [x] Calendar/event management
- [x] Dashboard with analytics

### **✅ Payment & Subscription**
- [x] Stripe integration
- [x] Subscription management
- [x] Plan upgrades/downgrades
- [x] Payment processing
- [x] Webhook handling

### **✅ User Experience**
- [x] Responsive design
- [x] Dark/light theme
- [x] Loading states
- [x] Error handling
- [x] Toast notifications

### **✅ Technical Features**
- [x] TypeScript
- [x] Real-time updates (Socket.io)
- [x] Form validation
- [x] API error handling
- [x] Database indexing

---

## **🚀 Phase 10: Launch Your MVP**

### **1. Final Testing**
- Test all user flows
- Verify payment processing
- Check mobile responsiveness
- Test error scenarios

### **2. Go Live**
- Deploy to production
- Monitor for errors
- Track user signups
- Monitor payment success rates

### **3. Marketing**
- Share your landing page
- Collect user feedback
- Iterate based on usage
- Scale successful features

---

## **📞 Support & Resources**

### **Documentation**
- [Stripe Documentation](https://stripe.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [React Documentation](https://reactjs.org/docs)

### **Test Cards**
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

### **Monitoring**
- Stripe Dashboard for payments
- MongoDB logs for database
- Application logs for errors
- User analytics for growth

---

## **🎉 Congratulations!**

You now have a fully functional SaaS MVP with:
- ✅ **Complete business management system**
- ✅ **Professional payment processing**
- ✅ **Scalable architecture**
- ✅ **Production-ready code**

**Next Steps:**
1. Get your first paying customers
2. Collect user feedback
3. Iterate and improve
4. Scale your business!

---

**Need Help?** Check the troubleshooting section or review the error logs for specific issues.