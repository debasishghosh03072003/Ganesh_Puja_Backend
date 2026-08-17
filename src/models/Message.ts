import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
  replyTo?: mongoose.Types.ObjectId;
  isPinned: boolean;
  deletedAt?: Date;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    attachmentUrl: { type: String, default: '' },
    attachmentType: { type: String, enum: ['image', 'file'], default: undefined },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
    isPinned: { type: Boolean, default: false },
    deletedAt: { type: Date },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

MessageSchema.index({ createdAt: -1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
