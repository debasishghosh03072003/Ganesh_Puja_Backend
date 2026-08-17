import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonAction?: string;
  imageUrl: string;
  imagePublicId?: string;
  displayOrder: number;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: '' },
    buttonText: { type: String, trim: true, default: '' },
    buttonAction: { type: String, trim: true, default: '' },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

BannerSchema.index({ status: 1, displayOrder: 1 });

const Banner: Model<IBanner> =
  mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);
export default Banner;
