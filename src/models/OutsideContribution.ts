import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOutsideContribution extends Document {
  _id: mongoose.Types.ObjectId;
  donorName: string;
  mobile?: string;
  amount: number;
  purpose: string;
  note?: string;
  date: Date;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OutsideContributionSchema = new Schema<IOutsideContribution>(
  {
    donorName: { type: String, required: true, trim: true },
    mobile: { type: String, trim: true, default: '' },
    amount: { type: Number, required: true, min: 1 },
    purpose: { type: String, required: true, default: 'Puja Chanda', trim: true },
    note: { type: String, trim: true, default: '' },
    date: { type: Date, required: true, default: Date.now },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

OutsideContributionSchema.index({ date: -1 });

const OutsideContribution: Model<IOutsideContribution> =
  mongoose.models.OutsideContribution ||
  mongoose.model<IOutsideContribution>('OutsideContribution', OutsideContributionSchema);
export default OutsideContribution;
