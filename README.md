# 🚀 Bizlytic - Business Dashboard

A comprehensive business dashboard application built with the MERN stack (MongoDB, Express.js, React, Node.js) and TypeScript. Track sales, expenses, and profit with beautiful charts and real-time updates.

## ✨ Features

### 🆓 Basic Plan (Free)
- **Local Storage**: Browser-based data storage (IndexedDB + LocalStorage)
- **Offline-First**: Works without internet connection
- **Single Device**: Data stays on your device
- **Core Features**: Sales tracking, expense management, basic reports

### 💎 Pro Plan (Premium)
- **Cloud Sync**: Multi-device synchronization
- **Real-time Updates**: Live data updates across devices
- **Advanced Reports**: Excel/PDF export capabilities
- **Cloud Backup**: Automated data backup and recovery
- **Priority Support**: Dedicated customer support

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **MongoDB** with Mongoose ODM
- **JWT Authentication** + **bcrypt** password hashing
- **Socket.io** for real-time updates
- **Express Validator** for input validation
- **Helmet** for security headers

### Frontend
- **React 18** + **TypeScript**
- **Vite** for fast development and building
- **Tailwind CSS** + **Shadcn UI** components
- **Recharts** for data visualization
- **React Router** for navigation
- **React Hook Form** for form management
- **Axios** for API communication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bizlytic
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install:all
```

### 3. Environment Setup
```bash
# Backend environment
cp backend/.env.example backend/.env

# Edit backend/.env with your configuration
MONGODB_URI=mongodb://localhost:27017/bizlytic
JWT_SECRET=your-super-secret-jwt-key-here
```

### 4. Start Development Servers
```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend    # Backend on port 5000
npm run dev:frontend   # Frontend on port 3000
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
bizlytic/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── lib/            # Utilities and API
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── vite.config.ts
├── package.json             # Root package.json
└── README.md
```

## 🔐 Authentication

The app uses JWT (JSON Web Tokens) for authentication:

- **Registration**: Create new account with email/password
- **Login**: Authenticate with credentials
- **Protected Routes**: All business data requires valid JWT
- **Token Storage**: JWT stored in localStorage (consider httpOnly cookies for production)

## 📊 Data Models

### User
- Basic info (name, email, business name)
- Plan type (basic/pro)
- Account status and timestamps

### Sale
- Customer and product details
- Quantity, pricing, and payment method
- Category and tags for organization

### Expense
- Description, amount, and category
- Vendor information and receipt tracking
- Recurring expense support

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/upgrade` - Upgrade to Pro plan

### Sales
- `GET /api/sales` - List sales with pagination
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale
- `GET /api/sales/stats/summary` - Sales statistics

### Expenses
- `GET /api/expenses` - List expenses with filters
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/stats/summary` - Expense statistics

### Reports
- `GET /api/reports/profit-loss` - Profit & loss report
- `GET /api/reports/sales-analysis` - Sales analysis
- `GET /api/reports/expense-breakdown` - Expense breakdown
- `GET /api/reports/export/excel` - Excel export (Pro only)

## 🎨 UI Components

Built with **Shadcn UI** and **Tailwind CSS**:

- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching support
- **Modern Components**: Cards, tables, forms, modals
- **Interactive Charts**: Line charts, pie charts, bar charts
- **Loading States**: Skeleton loaders and spinners

## 📱 Features by Plan

| Feature | Basic | Pro |
|---------|-------|-----|
| Local Storage | ✅ | ✅ |
| Cloud Sync | ❌ | ✅ |
| Real-time Updates | ❌ | ✅ |
| Excel/PDF Export | ❌ | ✅ |
| Cloud Backup | ❌ | ✅ |
| Multi-device | ❌ | ✅ |
| Priority Support | ❌ | ✅ |

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm run build        # Build TypeScript
npm run start        # Start production build
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/bizlytic

# View collections
show collections

# Sample queries
db.sales.find().limit(5)
db.expenses.find().limit(5)
```

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, AWS, DigitalOcean)

### Frontend Deployment
1. Build the app: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure API proxy for production

### Environment Variables
```bash
# Production
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bizlytic
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions

## 🔮 Roadmap

- [ ] Advanced analytics and forecasting
- [ ] Inventory management
- [ ] Customer relationship management (CRM)
- [ ] Invoice generation
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Advanced reporting templates
- [ ] API rate limiting and monitoring

---

**Built with ❤️ for small business owners**