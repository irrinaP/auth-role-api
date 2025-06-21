import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let channel: amqp.Channel;

export async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect(
      process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    );
    channel = await connection.createChannel();
    console.log('✔ User-service подключен к RabbitMQ');
    return channel;
  } catch (err) {
    console.error('❌ Ошибка подключения к RabbitMQ в user-service:', err);
    throw err;
  }
}

export function getChannel() {
  return channel;
}
