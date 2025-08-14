"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const timeout_1 = require("./middleware/timeout");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const sales_1 = __importDefault(require("./routes/sales"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const reports_1 = __importDefault(require("./routes/reports"));
const users_1 = __importDefault(require("./routes/users"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});
// Store io instance in app for route access
app.set('io', io);
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Add timeout middleware (30 seconds)
app.use((0, timeout_1.timeoutMiddleware)(30000));
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Test endpoint for debugging
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Backend is working!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        headers: req.headers
    });
});
// Test POST endpoint
app.post('/api/test', (req, res) => {
    res.json({
        message: 'POST request received!',
        body: req.body,
        timestamp: new Date().toISOString()
    });
});
// Test basic route
app.get('/api/basic', (req, res) => {
    res.json({ message: 'Basic route working!' });
});
// Test route with params
app.get('/api/echo/:message', (req, res) => {
    res.json({
        message: 'Echo route working!',
        echo: req.params.message,
        timestamp: new Date().toISOString()
    });
});
// Routes
console.log('🔧 Loading routes...');
app.use('/api/auth', auth_1.default);
console.log('✅ Auth routes loaded');
app.use('/api/sales', sales_1.default);
console.log('✅ Sales routes loaded');
app.use('/api/expenses', expenses_1.default);
console.log('✅ Expenses routes loaded');
app.use('/api/reports', reports_1.default);
console.log('✅ Reports routes loaded');
app.use('/api/users', users_1.default);
console.log('✅ Users routes loaded');
console.log('🎯 All routes loaded successfully!');
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
        await mongoose_1.default.connect(mongoURI);
        console.log('✅ Connected to MongoDB successfully!');
        console.log('📊 Database:', mongoose_1.default.connection.db?.databaseName || 'Unknown');
        console.log('🔗 Connection state:', mongoose_1.default.connection.readyState);
        // Test the connection
        if (mongoose_1.default.connection.db) {
            const collections = await mongoose_1.default.connection.db.listCollections().toArray();
            console.log('📚 Available collections:', collections.map(c => c.name));
        }
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.error('💡 Please check:');
        console.error('   1. MongoDB is running');
        console.error('   2. Connection string is correct');
        console.error('   3. Network/firewall settings');
        process.exit(1);
    }
};
// Error handling middleware
app.use((err, req, res, next) => {
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
    }
    catch (error) {
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
        mongoose_1.default.connection.close().then(() => {
            console.log('✅ Database connection closed');
            process.exit(0);
        });
    });
});
process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        mongoose_1.default.connection.close().then(() => {
            console.log('✅ Database connection closed');
            process.exit(0);
        });
    });
});
//# sourceMappingURL=index.js.map