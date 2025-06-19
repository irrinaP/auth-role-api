import dotenv from 'dotenv';
dotenv.config();

export const services = {
  userService: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  courseService: process.env.COURSE_SERVICE_URL || 'http://localhost:3002',
  rabbitmq: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
};
