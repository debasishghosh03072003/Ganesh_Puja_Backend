import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

ActivitySchema.index({ createdAt: -1 });

const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
export default Activity;
