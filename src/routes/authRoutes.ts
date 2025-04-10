import { Router, Request, Response } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  try {
    await authController.register(req, res);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error during signup' });
  }
});

router.post('/signin', async (req: Request, res: Response) => {
  try {
    await authController.login(req, res);
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Error during signin' });
  }
});

router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    await authController.getProfile(req, res);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error during getting profile' });
  }
});

router.delete(
  '/delete',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      await authController.deleteUser(req, res);
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ message: 'Error during deleting user' });
    }
  },
);

export default router;
