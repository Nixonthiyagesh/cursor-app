import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import salesRoutes from './routes/sales';
import expenseRoutes from './routes/expenses';
import reportRoutes from './routes/reports';
import calendarRoutes from './routes/calendar';
import paymentRoutes from './routes/payments';
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

// Health check
app.get('/api/health', (req, res: any) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    message: 'Server is running (MongoDB not configured)'
  });
});

// Test endpoint
app.get('/api/test', (req, res: any) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Simple payment test endpoint (no auth for testing)
app.get('/api/payments/test', (req, res: any) => {
  res.json({
    success: true,
    message: 'Payment endpoint is accessible',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res: any) => {
  res.status(404).json({ message: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 Bizlytic backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚠️  MongoDB not configured - using test endpoints only`);
  console.log(`💡 To enable full functionality, configure MongoDB and uncomment the database code`);
});