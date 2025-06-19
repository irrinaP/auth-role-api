import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import amqp from 'amqplib';

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

    // Подключаем RabbitMQ Consumer
    startRabbitMQConsumer().catch((err) => {
      console.error('RabbitMQ consumer error:', err);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

async function startRabbitMQConsumer() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const queue = 'user-service';
  await channel.assertQueue(queue, { durable: true });

  console.log(`🟢 [user-service] Waiting for messages in "${queue}"`);

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    const content = JSON.parse(msg.content.toString());
    console.log('📨 [user-service] Received message:', content);

    // Здесь можно выполнить бизнес-логику на основе запроса
    if (content.path === '/users' && content.method === 'GET') {
      console.log('📘 Получение списка пользователей...');
      // Тут можешь добавить MongoDB-запрос, если нужно
    }

    channel.ack(msg);
  });
}
