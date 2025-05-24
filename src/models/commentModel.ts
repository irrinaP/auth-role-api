import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    text: { type: String, required: true, maxlength: 255 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const Comment = mongoose.model<IComment>('Comment', commentSchema);
export default Comment;
