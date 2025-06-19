import { Request, Response } from 'express';
import { authService } from '../../src/services/authService';
import { UserModel } from '../models/user';

interface RequestWithUser extends Request {
  user?: { _id: string; username: string; role: string };
}

const register = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await authService.registerUser(username, password, role);
    const token = authService.generateToken(user._id.toString());

    res.status(201).json({
      token,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await authService.loginUser(username, password);
    const token = authService.generateToken(user._id.toString());

    res.status(200).json({
      token,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const getProfile = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export const authController = {
  register,
  login,
  getProfile,
  deleteUser,
};
