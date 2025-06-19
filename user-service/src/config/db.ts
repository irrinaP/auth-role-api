import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (): Promise<void> => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(process.env.MONGO_URI!);
      console.log('MongoDB connected!');
      break;
    } catch (error) {
      retries++;
      console.error(
        `❌ Ошибка подключения (попытка ${retries} из ${MAX_RETRIES}):`,
        (error as Error).message,
      );

      if (retries < MAX_RETRIES) {
        console.log(
          `🔁 Повторная попытка через ${RETRY_DELAY_MS / 1000} секунд...`,
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error(
          '🚫 Не удалось подключиться к MongoDB. Завершение процесса.',
        );
        process.exit(1);
      }
    }
  }
};

export { connectDB };
