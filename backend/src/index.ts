import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import salesRoutes from './routes/sales';
import expenseRoutes from './routes/expenses';
import reportRoutes from './routes/reports';
import calendarRoutes from './routes/calendar';
import paymentRoutes from './routes/payments';
import dashboardRoutes from './routes/dashboard';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizlytic';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));

// Special handling for Stripe webhooks (raw body)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Regular JSON parsing for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  socket.on('join-dashboard', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined dashboard`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/sales', authMiddleware, salesRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/calendar', authMiddleware, calendarRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Health check
app.get('/api/health', (req, res: any) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'Connected to MongoDB Atlas'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res: any) => {
  res.status(404).json({ message: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 Bizlytic backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💳 Stripe integration: ${process.env.STRIPE_SECRET_KEY ? 'Enabled' : 'Disabled'}`);
  console.log(`🗄️  Database: MongoDB Atlas`);
});