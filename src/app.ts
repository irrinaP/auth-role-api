import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

import authRoutes from './routes/authRoutes';
import pingRoutes from './routes/pingRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();
const PORT = process.env.PORT || 3000;

connectDB();

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', pingRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
