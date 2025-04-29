import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

router.post('/', authMiddleware, createCourse);
router.post('/courses', authMiddleware, upload.single('image'), createCourse);
router.put('/:id', authMiddleware, updateCourse);
router.delete('/:id', authMiddleware, deleteCourse);

export default router;
