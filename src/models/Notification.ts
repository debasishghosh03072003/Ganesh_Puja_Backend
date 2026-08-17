import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'announcement'
  | 'contribution'
  | 'expense'
  | 'puja_reminder'
  | 'meeting'
  | 'chat'
  | 'general';

export interface IDeliveryStats {
  total: number;
  success: number;
  failure: number;
  invalidTokensRemoved: number;
}

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  body: string;
  type: NotificationType;
  screen: string;
  recipients: string | string[]; // "all" or array of member ObjectId strings
  sentBy?: mongoose.Types.ObjectId;
  sentAt: Date;
  deliveryStats: IDeliveryStats;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryStatsSchema = new Schema<IDeliveryStats>(
  {
    total: { type: Number, default: 0 },
    success: { type: Number, default: 0 },
    failure: { type: Number, default: 0 },
    invalidTokensRemoved: { type: Number, default: 0 },
  },
  { _id: false }
);

const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    body: {
      type: String,
      required: [true, 'Message body is required'],
      trim: true,
      maxlength: [500, 'Body cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['announcement', 'contribution', 'expense', 'puja_reminder', 'meeting', 'chat', 'general'],
      default: 'announcement',
    },
    screen: {
      type: String,
      default: 'home',
      trim: true,
    },
    // "all" | array of member IDs
    recipients: {
      type: Schema.Types.Mixed,
      default: 'all',
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    deliveryStats: {
      type: DeliveryStatsSchema,
      default: () => ({ total: 0, success: 0, failure: 0, invalidTokensRemoved: 0 }),
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

NotificationSchema.index({ sentAt: -1 });
NotificationSchema.index({ type: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
