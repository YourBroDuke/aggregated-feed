import mongoose from 'mongoose';
import { Platform } from '../models/Platform.js';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please set MONGODB_URI in environment variables');
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    process.exit(1);
  }
} 

export async function initPlatforms() {
  const platformTypes = await Platform.find().select('type');
  const newPlatforms = [
    { name: '知乎', type: 'zhihu', icon: '/images/zhihu-icon.png', color: '#0084ff', backgroundColor: '#e6f4ff', domain: 'zhihu.com' },
    { name: '小红书', type: 'xiaohongshu', icon: '/images/xiaohongshu-icon.png', color: '#ff2442', backgroundColor: '#ffebee', domain: 'xiaohongshu.com' },
    { name: '哔哩哔哩', type: 'bilibili', icon: '/images/bilibili-icon.png', color: '#00a1d6', backgroundColor: '#e3f2fd', domain: 'bilibili.com' },
    { name: 'Twitter', type: 'twitter', icon: '/images/twitter-icon.jpg', color: '#1da1f2', backgroundColor: '#e3f2fd', domain: 'twitter.com' },
    { name: 'YouTube', type: 'youtube', icon: '/images/youtube-icon.png', color: '#ff0000', backgroundColor: '#ffebee', domain: 'youtube.com' },
  ];
  const platformsToInsert = newPlatforms.filter((p) => !platformTypes.some((pt) => pt.type === p.type));
  await Platform.insertMany(platformsToInsert);
}