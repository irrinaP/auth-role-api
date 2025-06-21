import express, { RequestHandler } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectToRabbitMQ, getChannel } from './utils/rabbitmq';
import { Request, Response } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
let isRabbitMQReady = false;

app.use(cors());
app.use(express.json());

connectToRabbitMQ()
  .then(() => {
    console.log('✔ Gateway подключен к RabbitMQ');
    isRabbitMQReady = true;
  })
  .catch((err) => {
    console.error('❌ Ошибка подключения к RabbitMQ:', err);
  });

const checkRabbitMQReady: RequestHandler = (req, res, next) => {
  if (!isRabbitMQReady) {
    res.status(503).json({ error: 'Сервис временно недоступен' });
    return;
  }
  next();
};

app.use('/api', checkRabbitMQReady);

app.all(/^\/api\/.*/, async (req: Request, res: Response): Promise<void> => {
  const { method, body, query, path } = req;
  const statusId = generateCorrelationId();

  const service = determineService(path);
  const targetQueue = serviceToQueueMap[service];

  if (!targetQueue) {
    res.status(400).json({ error: 'Неизвестный маршрут' });
    return;
  }

  const message = {
    statusId,
    method,
    path: path.replace('/api', ''),
    body,
    query,
    timestamp: new Date().toISOString(),
  };

  try {
    const channel = getChannel();
    channel.sendToQueue(targetQueue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    channel.sendToQueue(
      'status-service',
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
      },
    );

    res.status(202).json({ statusId });
  } catch (err) {
    console.error('❌ Ошибка отправки в очередь:', err);
    res.status(500).json({ error: 'Ошибка при обработке запроса' });
  }
});

const serviceToQueueMap: Record<string, string> = {
  user: 'user-service',
  status: 'status-service',
  tag: 'tag-service',
  course: 'course-service',
  lesson: 'lesson-service',
  comment: 'comment-service',
  enrollment: 'enrollment-service',
};

function determineService(path: string): string {
  const lower = path.toLowerCase();
  if (lower.includes('/auth') || lower.includes('/users')) return 'user';
  if (lower.includes('/status')) return 'status';
  if (lower.includes('/tags')) return 'tag';
  if (lower.includes('/lessons')) return 'lesson';
  if (lower.includes('/comments')) return 'comment';
  if (lower.includes('/enrollments')) return 'enrollment';
  if (lower.includes('/courses')) return 'course';
  return 'unknown';
}

function generateCorrelationId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

app.listen(PORT, () => {
  console.log(`🚀 Gateway запущен на порту ${PORT}`);
});
