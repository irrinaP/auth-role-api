// src/models/userModel.ts
import mongoose, { Document, Schema } from 'mongoose';

// Интерфейс без наследования от Document (может быть переиспользован)
export interface IUser {
  email: string;
  password: string;
  name?: string;
  role?: 'user' | 'admin';
}

// Интерфейс для документа (включает _id и методы mongoose)
export interface UserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
