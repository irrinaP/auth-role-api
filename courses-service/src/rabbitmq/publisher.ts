import amqp from 'amqplib';

const QUEUE_NAME = 'course_enrollments';

interface Enrollment {
  userId: string;
  courseId: string;
}

export async function publishEnrollmentMessage(data: Enrollment) {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });

    console.log('Message published to queue:', data);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Failed to publish message', error);
  }
}
