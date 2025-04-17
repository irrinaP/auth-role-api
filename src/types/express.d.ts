import { User } from '../models/userModel';

// Расширяем интерфейс Request, добавляя свойство user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Это необходимо для правильного применения типов в проекте
export {};
