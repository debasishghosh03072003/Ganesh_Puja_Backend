import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  message: string;
  attachmentUrl?: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  publishDate: Date;
  status: 'Published' | 'Draft';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    attachmentUrl: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['Normal', 'Important', 'Urgent'],
      default: 'Normal',
    },
    publishDate: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ['Published', 'Draft'],
      default: 'Published',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ status: 1, publishDate: -1 });

const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
export default Announcement;
