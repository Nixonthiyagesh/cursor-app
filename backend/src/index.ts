import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { timeoutMiddleware } from './middleware/timeout';

// Import routes
import authRoutes from './routes/auth';
import salesRoutes from './routes/sales';
import expensesRoutes from './routes/expenses';
import reportsRoutes from './routes/reports';
import usersRoutes from './routes/users';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Store io instance in app for route access
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add timeout middleware (30 seconds)
app.use(timeoutMiddleware(30000));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizlytic';
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('📍 URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to MongoDB successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🔗 Connection state:', mongoose.connection.readyState);
    
    // Test the connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('💡 Please check:');
    console.error('   1. MongoDB is running');
    console.error('   2. Connection string is correct');
    console.error('   3. Network/firewall settings');
    process.exit(1);
  }
};

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

// Start server only after DB connection
const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`🚀 Bizlytic backend server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔌 Socket.io server ready`);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
});