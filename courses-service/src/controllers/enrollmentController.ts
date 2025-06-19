import { Request, Response } from 'express';
import Enrollment from '../models/enrollmentModel';
import Lesson from '../models/lessonModel';

interface RequestWithUser extends Request {
  user?: {
    _id: string;
  };
}

export const enrollInCourse = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { courseId } = req.body;

    const existing = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });
    if (existing) {
      res.status(400).json({ error: 'Already enrolled' });
      return;
    }

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
    });
    res.status(201).json(enrollment);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Enrollment failed' });
  }
};

export const getCourseProgress = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });
    if (!enrollment) {
      res.status(404).json({ error: 'Enrollment not found' });
      return;
    }

    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completed = enrollment.completedLessons.length;
    const progress =
      totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

    res.json({ totalLessons, completed, progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get progress' });
  }
};

export const uncompleteLesson = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { courseId, lessonId } = req.body;

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });
    if (!enrollment) {
      res.status(404).json({ error: 'Enrollment not found' });
      return;
    }

    enrollment.completedLessons = enrollment.completedLessons.filter(
      (id) => id.toString() !== lessonId,
    );
    await enrollment.save();

    res.json({ message: 'Lesson uncompleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to uncomplete lesson' });
  }
};

export const countStudentsOnCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { courseId } = req.params;
  const count = await Enrollment.countDocuments({ course: courseId });
  res.json({ courseId, studentCount: count });
};

export const completeLesson = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { courseId, lessonId } = req.body;

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });
    if (!enrollment) {
      res.status(404).json({ error: 'Enrollment not found' });
      return;
    }

    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId,
    );
    if (alreadyCompleted) {
      res.status(400).json({ error: 'Lesson already completed' });
      return;
    }

    enrollment.completedLessons.push(lessonId);
    await enrollment.save();

    res.json({ message: 'Lesson marked as completed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
};
