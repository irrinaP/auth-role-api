import { Request, Response } from 'express';
import { Course } from '../models/courseModel';
import RequestWithUser from '../middlewares/authMiddleware';
import slugify from 'slugify';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

interface CourseQuery {
  search?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  page?: string | number;
  limit?: string | number;
  sort?: string;
}

interface CourseBody {
  title: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

type CourseFilter = {
  title?: { $regex: string; $options: string };
  category?: string;
  level?: string;
};

export const getAllCourses = async (
  req: Request<Record<string, unknown>, unknown, unknown, CourseQuery>,
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
    if (typeof search === 'string')
      filter.title = { $regex: search, $options: 'i' };
    if (typeof category === 'string') filter.category = category;
    if (typeof level === 'string') filter.level = level;

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

export const getCourseById = async (
  req: Request<{ id: string }>,
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

export const createCourse = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ message: 'Неавторизованный доступ' });
    return;
  }

  const { title, description, price, image, category, level, tags } = req.body;

  if (!title) {
    res.status(400).json({ message: 'Поле "title" обязательно' });
    return;
  }

  try {
    const slug = slugify(title, { lower: true, strict: true });
    let savedImagePath = image;

    if (image && fs.existsSync(image)) {
      const ext = path.extname(image);
      const newFileName = `${uuidv4()}${ext}`;
      const destinationDir = path.join('uploads');
      const destinationPath = path.join(destinationDir, newFileName);

      fs.mkdirSync(destinationDir, { recursive: true });

      const watermarkPath = path.join(__dirname, '../../public/watermark.png');

      const hasWatermark = fs.existsSync(watermarkPath);

      console.log('Путь к ватермарке:', watermarkPath);
      console.log('Существует ли ватермарка?', hasWatermark);

      const baseImage = sharp(image).resize({ width: 800 });

      if (hasWatermark) {
        const watermarkBuffer = await sharp(watermarkPath)
          .removeAlpha()
          .resize(200, 200)
          .toBuffer();

        console.log('Буфер ватермарки:', watermarkBuffer);

        await baseImage
          .composite([
            {
              input: watermarkBuffer,
              gravity: 'southeast',
              blend: 'over',
            },
          ])
          .toFile(destinationPath)
          .catch((err) => {
            console.error('Ошибка при наложении ватермарки:', err);
          });
      } else {
        await baseImage.toFile(destinationPath);
      }

      savedImagePath = destinationPath;
    }

    const newCourse = await Course.create({
      title,
      slug,
      description,
      price,
      image: savedImagePath,
      category,
      level,
      tags,
      author: user._id,
    });

    res.status(201).json(newCourse);
  } catch (err: unknown) {
    console.error('Ошибка при создании курса:', err);
    res.status(400).json({
      message: 'Ошибка при создании курса',
      error: err instanceof Error ? err.message : 'Неизвестная ошибка',
    });
  }
};

export const updateCourse = async (
  req: Request<{ id: string }, unknown, Partial<CourseBody>>,
  res: Response,
): Promise<void> => {
  try {
    const updatedData = {
      ...req.body,
      ...(req.body.title
        ? { slug: slugify(req.body.title, { lower: true, strict: true }) }
        : {}),
    };

    const course = await Course.findByIdAndUpdate(req.params.id, updatedData, {
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
