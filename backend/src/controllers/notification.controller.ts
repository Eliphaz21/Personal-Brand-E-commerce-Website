import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';
import Notification from '../models/Notification.model';

export const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ userId });

  // Calculate unread count
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  sendSuccess(
    res,
    {
      notifications,
      unreadCount,
    },
    'Notifications fetched successfully',
    200,
    { page, totalPages: Math.ceil(total / limit), total }
  );
});

export const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const notificationId = req.params.id;

  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  sendSuccess(res, { notification }, 'Notification marked as read', 200);
});

export const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  await Notification.updateMany({ userId, isRead: false }, { isRead: true });

  sendSuccess(res, null, 'All notifications marked as read', 200);
});
