import mongoose, { Document } from 'mongoose';

export interface IPlatform extends Document {
  name: string;
  type: string;
  icon: string;
  color: string;
  backgroundColor: string;
  domain: string;
}

const platformSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  backgroundColor: { type: String, required: true },
  domain: { type: String, required: true }
}, { timestamps: true });

export const Platform = mongoose.model<IPlatform>('Platform', platformSchema); 