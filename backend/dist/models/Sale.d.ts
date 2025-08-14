import mongoose, { Document } from 'mongoose';
export interface ISale extends Document {
    userId: mongoose.Types.ObjectId;
    customerName: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'transfer' | 'other';
    saleDate: Date;
    notes?: string;
    category: string;
    tags: string[];
}
declare const _default: mongoose.Model<ISale, {}, {}, {}, mongoose.Document<unknown, {}, ISale, {}, {}> & ISale & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Sale.d.ts.map