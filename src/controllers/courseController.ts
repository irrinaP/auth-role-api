import { Request, Response } from 'express';
import { Course } from '../models/courseModel';
import RequestWithUser from '../middlewares/authMiddleware';

// Тип для query-параметров
interface CourseQuery {
  search?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  page?: string | number;
  limit?: string | number;
  sort?: string;
}

// Тип для тела курса
interface CourseBody {
  title: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

// Тип фильтра для MongoDB
type CourseFilter = {
  title?: { $regex: string; $options: string };
  category?: string;
  level?: string;
};

// Получить все курсы
export const getAllCourses = async (
  req: Request<Record<string, unknown>, unknown, unknown, CourseQuery>, // заменили {} на Record<string, unknown> и unknown
  res: Response,
): Promise<void> => {
  try {
    const {
      search,
      category,
      level,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const filter: CourseFilter = {};

    if (typeof search === 'string') {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (typeof category === 'string') {
      filter.category = category;
    }

    if (typeof level === 'string') {
      filter.level = level;
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const courses = await Course.find(filter)
      .sort(String(sort))
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      data: courses,
    });
  } catch (err: unknown) {
    res.status(500).json({
      message: 'Ошибка при получении курсов',
      error: err instanceof Error ? err.message : 'Неизвестная ошибка',
    });
  }
};

// Получить курс по ID
export const getCourseById = async (
  req: Request<{ id: string }>, // уточнили тип параметра
  res: Response,
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404).json({ message: 'Курс не найден' });
      return;
    }

    res.json(course);
  } catch (err: unknown) {
    res.status(500).json({
      message: 'Ошибка при получении курса',
      error: err instanceof Error ? err.message : 'Неизвестная ошибка',
    });
  }
};

// Создание курса
export const createCourse = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  // Теперь TypeScript знает о req.user
  const user = req.user; // Убрали type assertion

  if (!user) {
    res.status(401).json({ message: 'Неавторизованный доступ' });
    return;
  }

  const newCourse = await Course.create({
    ...req.body,
    author: user._id,
  });

  res.status(201).json(newCourse);
};

// Обновление курса
export const updateCourse = async (
  req: Request<{ id: string }, unknown, Partial<CourseBody>>, // уточнили тип параметра и тела
  res: Response,
): Promise<void> => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!course) {
      res.status(404).json({ message: 'Курс не найден' });
      return;
    }

    res.json(course);
  } catch (err: unknown) {
    res.status(400).json({
      message: 'Ошибка при обновлении курса',
      error: err instanceof Error ? err.message : 'Неизвестная ошибка',
    });
  }
};

// Удаление курса
export const deleteCourse = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      res.status(404).json({ message: 'Курс не найден' });
      return;
    }

    res.json({ message: 'Курс удалён' });
  } catch (err: unknown) {
    res.status(500).json({
      message: 'Ошибка при удалении курса',
      error: err instanceof Error ? err.message : 'Неизвестная ошибка',
    });
  }
};
