import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import path from 'path';

import authRoutes from './routes/authRoutes';
import pingRoutes from './routes/pingRoutes';
import userRoutes from './routes/userRoutes';
import courseRoutes from './routes/courseRoutes';
import lessonRoutes from './routes/lessonRoutes';
import commentRoutes from './routes/commentRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';

dotenv.config();
const PORT = process.env.PORT || 3000;

connectDB();

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', pingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/uploads', express.static(path.resolve('uploads')));
app.use('/api/lessons', lessonRoutes);
app.use('/api/comments', commentRoutes);
app.use('/enrollments', enrollmentRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
