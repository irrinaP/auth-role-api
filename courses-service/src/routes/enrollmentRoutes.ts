import express from 'express';
import {
  enrollInCourse,
  getCourseProgress,
  uncompleteLesson,
  countStudentsOnCourse,
  completeLesson,
} from '../controllers/enrollmentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/enroll', authMiddleware, enrollInCourse);
router.get('/progress/:courseId', authMiddleware, getCourseProgress);
router.post('/uncomplete', authMiddleware, uncompleteLesson);
router.get('/count/:courseId', countStudentsOnCourse);
router.post('/complete', authMiddleware, completeLesson);

export default router;
