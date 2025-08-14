import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sale from '../models/Sale';
import Expense from '../models/Expense';
import User from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizlytic';

async function createSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a test user
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        plan: 'pro', // Set to pro to test all features
        isActive: true
      });
      await user.save();
      console.log('✅ Created test user');
    } else {
      console.log('✅ Found existing test user');
    }

    // Clear existing data
    await Sale.deleteMany({ userId: user._id });
    await Expense.deleteMany({ userId: user._id });
    console.log('✅ Cleared existing data');

    // Create sample sales data
    const sampleSales = [
      {
        userId: user._id,
        productName: 'Premium Widget',
        quantity: 5,
        unitPrice: 29.99,
        totalAmount: 149.95,
        category: 'Electronics',
        saleDate: new Date('2024-12-01'),
        customerName: 'John Doe',
        paymentMethod: 'card'
      },
      {
        userId: user._id,
        productName: 'Office Chair',
        quantity: 2,
        unitPrice: 199.99,
        totalAmount: 399.98,
        category: 'Furniture',
        saleDate: new Date('2024-12-05'),
        customerName: 'Jane Smith',
        paymentMethod: 'transfer'
      },
      {
        userId: user._id,
        productName: 'Marketing Package',
        quantity: 1,
        unitPrice: 999.99,
        totalAmount: 999.99,
        category: 'Services',
        saleDate: new Date('2024-12-10'),
        customerName: 'Business Corp',
        paymentMethod: 'card'
      },
      {
        userId: user._id,
        productName: 'Software License',
        quantity: 10,
        unitPrice: 49.99,
        totalAmount: 499.90,
        category: 'Software',
        saleDate: new Date('2024-12-15'),
        customerName: 'Tech Solutions',
        paymentMethod: 'transfer'
      }
    ];

    await Sale.insertMany(sampleSales);
    console.log('✅ Created sample sales data');

    // Create sample expenses data
    const sampleExpenses = [
      {
        userId: user._id,
        title: 'Office Supplies',
        amount: 89.50,
        category: 'Office',
        expenseDate: new Date('2024-12-02'),
        description: 'Pens, paper, and other office supplies',
        paymentMethod: 'card'
      },
      {
        userId: user._id,
        title: 'Internet Bill',
        amount: 79.99,
        category: 'Utilities',
        expenseDate: new Date('2024-12-03'),
        description: 'Monthly internet service',
        paymentMethod: 'transfer',
        isRecurring: true,
        recurringPeriod: 'monthly'
      },
      {
        userId: user._id,
        title: 'Marketing Campaign',
        amount: 250.00,
        category: 'Marketing',
        expenseDate: new Date('2024-12-08'),
        description: 'Facebook ads and Google ads',
        paymentMethod: 'card'
      },
      {
        userId: user._id,
        title: 'Employee Training',
        amount: 150.00,
        category: 'Training',
        expenseDate: new Date('2024-12-12'),
        description: 'Online course subscriptions',
        paymentMethod: 'card'
      }
    ];

    await Expense.insertMany(sampleExpenses);
    console.log('✅ Created sample expenses data');

    console.log('✅ Sample data creation completed successfully!');
    console.log(`📊 Created ${sampleSales.length} sales and ${sampleExpenses.length} expenses`);
    console.log(`👤 User ID: ${user._id}`);
    console.log(`📧 Test with email: ${user.email}`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createSampleData();