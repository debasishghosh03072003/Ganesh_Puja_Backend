import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  paidBy: mongoose.Types.ObjectId;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';
  description?: string;
  date: Date;
  receiptUrl?: string;
  receiptPublicId?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'],
      required: true,
      default: 'Cash',
    },
    description: { type: String, trim: true, default: '' },
    date: { type: Date, required: true, default: Date.now },
    receiptUrl: { type: String, default: '' },
    receiptPublicId: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ExpenseSchema.index({ paidBy: 1 });
ExpenseSchema.index({ date: -1 });

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
export default Expense;
