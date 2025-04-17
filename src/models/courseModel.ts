import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface ICourse extends Document {
  title: string;
  slug: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  published: boolean;
  author: mongoose.Types.ObjectId;
  tags?: string[];
  createdAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
    required: true,
  },
  published: { type: Boolean, default: false },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

// Автоматическая генерация slug перед сохранением
courseSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next();
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

export const Course = mongoose.model<ICourse>('Course', courseSchema);
