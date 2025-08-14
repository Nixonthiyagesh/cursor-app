"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Generate JWT Token
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    const payload = { userId };
    const options = { expiresIn: '7d' };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('firstName').trim().notEmpty(),
    (0, express_validator_1.body)('lastName').trim().notEmpty(),
    (0, express_validator_1.body)('businessName').trim().notEmpty()
], async (req, res) => {
    console.log('🚀 Registration request received:', {
        email: req.body.email,
        businessName: req.body.businessName,
        timestamp: new Date().toISOString()
    });
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { email, password, firstName, lastName, businessName } = req.body;
        console.log('✅ Validation passed, checking existing user...');
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        console.log('✅ No existing user, creating new user...');
        // Create new user
        const user = new User_1.default({
            email,
            password,
            firstName,
            lastName,
            businessName,
            plan: 'basic' // Default to basic plan
        });
        console.log('💾 Saving user to database...');
        await user.save();
        console.log('✅ User saved successfully:', user._id);
        // Generate token
        console.log('🔑 Generating JWT token...');
        const token = generateToken(user._id.toString());
        console.log('✅ Token generated successfully');
        console.log('🎉 Registration completed successfully');
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    businessName: user.businessName,
                    plan: user.plan
                },
                token
            }
        });
    }
    catch (error) {
        console.error('💥 Registration error:', error);
        // Check if it's a MongoDB connection error
        if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
            return res.status(503).json({
                success: false,
                message: 'Database connection error. Please try again later.'
            });
        }
        // Check if it's a duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});
// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { email, password } = req.body;
        // Check if user exists
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Check if user is active
        if (!user.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Account is deactivated'
            });
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        // Generate token
        const token = generateToken(user._id.toString());
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    businessName: user.businessName,
                    plan: user.plan
                },
                token
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});
// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        // Add user property to Request type
        const user = req.user;
        res.json({
            success: true,
            data: {
                user: user
            }
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
// @route   PUT /api/auth/upgrade
// @desc    Upgrade user to Pro plan
// @access  Private
router.put('/upgrade', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (user.plan === 'pro') {
            return res.status(400).json({
                success: false,
                message: 'User is already on Pro plan'
            });
        }
        user.plan = 'pro';
        await user.save();
        res.json({
            success: true,
            message: 'Successfully upgraded to Pro plan',
            data: {
                user: user
            }
        });
    }
    catch (error) {
        console.error('Upgrade error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during upgrade'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map