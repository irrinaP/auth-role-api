import { Request, Response } from 'express';
import Comment from '../models/commentModel';

export const createComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { lesson, text } = req.body;
    const userId = req.user?._id;
    res.send(`User ID: ${userId}`);

    const comment = await Comment.create({ user: userId, lesson, text });
    res.status(201).json(comment);
  } catch (err) {
    console.error('Failed to add comment:', err);
    res.status(400).json({ error: 'Failed to add comment' });
  }
};

export const getCommentsByLesson = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const comments = await Comment.find({ lesson: req.params.lessonId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.json(comments);
};

export const deleteComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const comment = await Comment.findByIdAndDelete(req.params.commentId);
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }
  res.json({ message: 'Comment deleted' });
};
