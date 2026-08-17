import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpenseCategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseCategorySchema = new Schema<IExpenseCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ExpenseCategory: Model<IExpenseCategory> =
  mongoose.models.ExpenseCategory ||
  mongoose.model<IExpenseCategory>('ExpenseCategory', ExpenseCategorySchema);
export default ExpenseCategory;
