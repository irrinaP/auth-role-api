import { Router } from 'express';
import { pingController } from '../controllers/pingController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/ping', authMiddleware, pingController.ping);

export default router;
