import mongoose, { Document, Schema } from 'mongoose';

export interface IFollowedUser extends Document {
  _id: mongoose.Types.ObjectId;
  platform: string;
  profileUrl: string;
  name?: string;
  username?: string;
  avatar?: string;
  followedAt: Date;
  syncCursor?: string;
  syncStatus?: 'pending' | 'success' | 'failed';
}

const FollowedUserSchema = new Schema<IFollowedUser>({
  _id: { type: Schema.Types.ObjectId, required: true, default: () => new mongoose.Types.ObjectId() },
  platform: { type: String, required: true },
  profileUrl: { type: String, required: true },
  name: { type: String },
  username: { type: String },
  avatar: { type: String },
  followedAt: { type: Date, required: true },
  syncCursor: { type: String },
  syncStatus: { 
    type: String, 
    enum: ['pending', 'success', 'failed']
  }
}, {
  timestamps: true
});

export const FollowedUser = mongoose.model<IFollowedUser>('FollowedUser', FollowedUserSchema); 