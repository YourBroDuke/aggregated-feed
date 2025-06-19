import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedItem extends Document {
  _id: mongoose.Types.ObjectId;
  businessId: string;
  platform: string;
  author: {
    userId: mongoose.Types.ObjectId;
    name: string;
    avatar: string;
    username: string;
  };
  title: string;
  content: string;
  originalUrl: string;
  postedAt: Date;
}

const FeedItemSchema = new Schema<IFeedItem>({
  _id: { type: Schema.Types.ObjectId, required: true, default: () => new mongoose.Types.ObjectId() },
  businessId: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  author: {
    userId: { type: Schema.Types.ObjectId, ref: 'FollowedUser', required: true },
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    username: { type: String, required: true }
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  originalUrl: { type: String, required: true },
  postedAt: { type: Date, required: true }
}, {
  timestamps: true
});

export const FeedItem = mongoose.model<IFeedItem>('FeedItem', FeedItemSchema); 