import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContribution extends Document {
  _id: mongoose.Types.ObjectId;
  member: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';
  date: Date;
  note?: string;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContributionSchema = new Schema<IContribution>(
  {
    member: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'],
      required: true,
      default: 'Cash',
    },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, default: '' },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ContributionSchema.index({ member: 1 });
ContributionSchema.index({ date: -1 });

const Contribution: Model<IContribution> =
  mongoose.models.Contribution || mongoose.model<IContribution>('Contribution', ContributionSchema);
export default Contribution;
