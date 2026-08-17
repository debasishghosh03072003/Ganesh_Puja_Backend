import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGallery extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  imagePublicId?: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      required: true,
      enum: [
        'Ganesh Idol',
        'Pandal',
        'Decoration',
        'Puja',
        'Aarti',
        'Cultural Program',
        'Committee',
        'Previous Years',
        'Other',
      ],
      default: 'Puja',
    },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, default: '' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

GallerySchema.index({ category: 1 });
GallerySchema.index({ createdAt: -1 });

const Gallery: Model<IGallery> =
  mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);
export default Gallery;
