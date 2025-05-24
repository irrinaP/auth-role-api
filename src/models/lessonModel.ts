import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  content?: string;
  videoUrl?: string;
  course: mongoose.Types.ObjectId;
  order?: number;
  createdAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    content: { type: String },
    videoUrl: { type: String },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    order: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);
export default Lesson;
