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
import { publishEnrollmentMessage } from '../rabbitmq/publisher';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

router.post('/', authMiddleware, createCourse);
router.post('/courses', authMiddleware, upload.single('image'), createCourse);

router.post('/enroll', async (req, res) => {
  const enrollmentData = req.body;

  res.status(200).json({ message: 'Enrollment received, processing...' });

  await publishEnrollmentMessage(enrollmentData);
});
router.put('/:id', authMiddleware, updateCourse);
router.delete('/:id', authMiddleware, deleteCourse);

export default router;
