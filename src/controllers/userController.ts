import { Request, Response } from 'express';
import { UserModel } from '../models/user';
import { UserDocument } from '../models/userModel'; // Импортируем интерфейс UserDocument

const getUserData = async (
  req: Request & { user?: UserDocument },
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(400).json({ error: 'User ID is missing from the request' });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      username: user.username,
      role: user.role || 'N/A',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteUser = async (
  req: Request & { user?: UserDocument },
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(400).json({ error: 'User ID is missing from the request' });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await UserModel.deleteOne({ _id: userId });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateUserData = async (
  req: Request & { user?: UserDocument },
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(400).json({ error: 'User ID is missing from the request' });
      return;
    }

    const { username, role } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.username = username || user.username;
    user.role = role || user.role;

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const userController = {
  getUserData,
  deleteUser,
  updateUserData,
};
