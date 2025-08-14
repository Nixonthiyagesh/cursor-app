import mongoose, { Document } from 'mongoose';
export interface IExpense extends Document {
    userId: mongoose.Types.ObjectId;
    description: string;
    amount: number;
    category: string;
    expenseDate: Date;
    paymentMethod: 'cash' | 'card' | 'transfer' | 'other';
    vendor?: string;
    receipt?: string;
    isRecurring: boolean;
    recurringPeriod?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    tags: string[];
    notes?: string;
}
declare const _default: mongoose.Model<IExpense, {}, {}, {}, mongoose.Document<unknown, {}, IExpense, {}, {}> & IExpense & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Expense.d.ts.map