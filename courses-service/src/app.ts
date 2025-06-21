import express from 'express';
import cors from 'cors';
import courseRoutes from './routes/courseRoutes';
import { connectDB } from './config/db';
import { consumeEnrollmentMessages } from './rabbitmq/consumer';
import amqp from 'amqplib';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use('/courses', courseRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Course service listening on port ${PORT}`);
  });

  consumeEnrollmentMessages().catch((err) => {
    console.error('Failed to start enrollment consumer', err);
  });

  startRabbitMQConsumer().catch((err) => {
    console.error('RabbitMQ consumer error:', err);
  });
});

async function startRabbitMQConsumer() {
  const connection = await amqp.connect('amqp://rabbitmq');
  const channel = await connection.createChannel();

  const queue = 'course-service';
  await channel.assertQueue(queue, { durable: true });

  console.log(`🟢 [course-service] Waiting for messages in "${queue}"`);

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    const content = JSON.parse(msg.content.toString());
    console.log('📨 [course-service] Received message:', content);

    if (content.path === '/courses' && content.method === 'GET') {
      console.log('📘 Получение списка курсов...');
    }

    channel.ack(msg);
  });
}
