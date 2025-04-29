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
  title: {
    type: String,
    required: [true, 'Название курса обязательно'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Цена курса обязательна'],
    min: [0, 'Цена не может быть отрицательной'],
  },
  image: {
    type: String,
    required: [true, 'Изображение обязательно'],
  },
  category: {
    type: String,
    required: [true, 'Категория обязательна'],
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
    required: true,
  },
  published: {
    type: Boolean,
    default: false,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Автор обязателен'],
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

courseSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next();
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

export const Course = mongoose.model<ICourse>('Course', courseSchema);
