import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  _id: mongoose.Types.ObjectId;
  committeeName: string;
  pujaYear: string;
  pujaDate: string;
  location: string;
  description: string;
  committeeLogo?: string;
  expectedChandaTotal: number;
  expectedChandaPerMember: number;
  defaultBanner?: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    committeeName: { type: String, default: 'Shree Ganesh Puja Committee' },
    pujaYear: { type: String, default: '2026' },
    pujaDate: { type: String, default: '2026-08-25' },
    location: { type: String, default: 'Central Pandal Ground' },
    description: { type: String, default: 'Private Committee Management System' },
    committeeLogo: { type: String, default: '' },
    expectedChandaTotal: { type: Number, default: 130000 },
    expectedChandaPerMember: { type: Number, default: 10000 },
    defaultBanner: { type: String, default: '' },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export default Settings;
