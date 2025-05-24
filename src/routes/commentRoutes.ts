import express from 'express';
import {
  createComment,
  getCommentsByLesson,
  deleteComment,
} from '../controllers/commentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createComment);
router.get('/:lessonId', getCommentsByLesson);
router.delete('/:commentId', authMiddleware, deleteComment);

export default router;
