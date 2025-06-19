import amqp from 'amqplib';

let channel: amqp.Channel | null = null;

const RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 3000;

export const connectToRabbitMQ = async () => {
  const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq';
  console.log(`🚀 Подключение к RabbitMQ по адресу: ${url}`);

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const connection = await amqp.connect(url);
      channel = await connection.createChannel();
      console.log('✅ Подключено к RabbitMQ');

      connection.on('close', () => {
        console.error('❌ RabbitMQ соединение закрыто');
        channel = null;
      });

      connection.on('error', (err) => {
        console.error('❌ Ошибка соединения с RabbitMQ:', err);
        channel = null;
      });

      return; // Успешное подключение
    } catch (error: unknown) {
      const err = error as Error;
      console.error(
        `❌ Попытка ${attempt} — ошибка подключения к RabbitMQ:`,
        err.message,
      );
      if (attempt < RETRY_ATTEMPTS) {
        console.log(`⏳ Повтор через ${RETRY_DELAY_MS / 1000} секунд...`);
        await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      } else {
        console.error(
          '❌ Превышено максимальное количество попыток подключения к RabbitMQ',
        );
        throw err;
      }
    }
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error('❌ Канал RabbitMQ не инициализирован');
  }
  return channel;
};
