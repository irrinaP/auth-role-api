import { Request, Response } from 'express';
import Lesson from '../models/lessonModel';

export const createLesson = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json(lesson);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create lesson' });
  }
};

export const getLessons = async (_: Request, res: Response): Promise<void> => {
  const lessons = await Lesson.find().populate('course');
  res.json(lessons);
};

export const getLessonById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const lesson = await Lesson.findById(req.params.id).populate('course');
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }
  res.json(lesson);
};

export const updateLesson = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }
  res.json(lesson);
};

export const deleteLesson = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }
  res.json({ message: 'Lesson deleted' });
};
