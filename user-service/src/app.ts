import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import amqp from 'amqplib';
import { UserModel } from './models/user';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/', authRoutes);

app.get('/', (req, res) => {
  res.send('User Service is running');
});

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`User service listening on port ${PORT}`);
    });

    startRabbitMQConsumer().catch((err) => {
      console.error('RabbitMQ consumer error:', err);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

async function startRabbitMQConsumer() {
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
  const connection = await amqp.connect(rabbitUrl);
  const channel = await connection.createChannel();

  const queue = 'user-service';
  await channel.assertQueue(queue, { durable: true });

  console.log(`🟢 [user-service] Waiting for messages in "${queue}"`);

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    const content = JSON.parse(msg.content.toString());
    console.log('📨 [user-service] Received message:', content);

    const { path, method, body } = content;

    try {
      if (
        method === 'POST' &&
        (path === '/auth/register' || path === '/users')
      ) {
        const { username, password, role } = body;

        if (!username || !password || !role) {
          console.log('⚠ username, password или role отсутствуют в запросе');
          channel.ack(msg);
          return;
        }

        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
          console.log('⚠ Пользователь с таким username уже существует');
          channel.ack(msg);
          return;
        }

        const newUser = new UserModel({ username, password, role });
        await newUser.save();

        console.log('✅ Пользователь создан:', newUser.username);
      } else {
        console.log(`ℹ Необрабатываемый маршрут или метод: ${method} ${path}`);
      }
    } catch (err) {
      console.error('❌ Ошибка при обработке сообщения:', err);
    }

    channel.ack(msg);
  });
}
