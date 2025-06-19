import amqp from 'amqplib';

const QUEUE_NAME = 'course_enrollments';

interface Enrollment {
  userId: string;
  courseId: string;
}

export async function consumeEnrollmentMessages() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    channel.prefetch(1);

    console.log('Waiting for messages in queue:', QUEUE_NAME);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const content = msg.content.toString();
          const enrollment: Enrollment = JSON.parse(content);

          console.log('Received enrollment:', enrollment);

          await processEnrollment(enrollment);

          channel.ack(msg);
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.error('Failed to consume messages', error);
  }
}

async function processEnrollment(enrollment: Enrollment) {
  console.log('Processing enrollment:', enrollment);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log('Enrollment processed');
}
