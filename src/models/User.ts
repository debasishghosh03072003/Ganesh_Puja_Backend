import mongoose, { Schema, Document, Model } from 'mongoose';

// FCM Token sub-schema for push notification support
export interface IFcmToken {
  token: string;
  deviceType: 'android' | 'ios' | 'web';
  createdAt?: Date;
  updatedAt?: Date;
}

const FcmTokenSchema = new Schema<IFcmToken>(
  {
    token: { type: String, required: true },
    deviceType: { type: String, enum: ['android', 'ios', 'web'], default: 'android' },
  },
  { _id: false, timestamps: true }
);

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  mobile: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  profileImage?: string;
  committeeId?: string;
  totalChanda: number;
  totalExpense: number;
  createdAt: Date;
  updatedAt: Date;
  fcmTokens: IFcmToken[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    profileImage: { type: String, default: '' },
    committeeId: { type: String, default: 'shree_ganesh_puja_2026' },
    totalChanda: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },
    fcmTokens: { type: [FcmTokenSchema], default: [] },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;

