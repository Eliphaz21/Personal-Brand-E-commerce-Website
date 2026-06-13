import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';
import Message from '../models/Message.model';
import User from '../models/User.model';
import { sendContactReplyEmail } from '../services/email.service';

/**
 * @desc    Submit a contact message (Public or Authenticated)
 * @route   POST /api/messages
 * @access  Public
 */
export const createMessage = catchAsync(async (req: Request, res: Response) => {
  const { guestName, guestEmail, subject, body } = req.body;
  const userId = req.user?.userId; // Might be undefined if guest

  let messageData: any = { subject, body };

  if (userId) {
    // Authenticated user
    messageData.fromUserId = userId;
    messageData.isDirectMessage = true;
    
    // Auto-fill guestName and guestEmail for convenience from user profile if not provided
    const user = await User.findById(userId);
    if (user) {
      messageData.guestName = guestName || user.name;
      messageData.guestEmail = guestEmail || user.email;
    }
  } else {
    // Guest
    if (!guestName || !guestEmail) {
      throw new AppError('Guest name and email are required for unauthenticated users.', 400);
    }
    messageData.guestName = guestName;
    messageData.guestEmail = guestEmail;
    messageData.isDirectMessage = false;
  }

  const message = await Message.create(messageData);

  sendSuccess(res, { message }, 'Message sent successfully. We will get back to you soon.', 201);
});

/**
 * @desc    Get all messages (paginated, filterable)
 * @route   GET /api/messages
 * @access  Private (Admin Only)
 */
export const getMessages = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('fromUserId', 'name email avatar');

  const total = await Message.countDocuments(filter);
  const unreadCount = await Message.countDocuments({ status: 'unread' });

  sendSuccess(
    res,
    {
      messages,
      total,
      unreadCount,
    },
    'Messages fetched successfully',
    200,
    { page, totalPages: Math.ceil(total / limit), total }
  );
});

/**
 * @desc    Get a single message by ID
 * @route   GET /api/messages/:id
 * @access  Private (Admin Only)
 */
export const getMessageById = catchAsync(async (req: Request, res: Response) => {
  const message = await Message.findById(req.params.id).populate('fromUserId', 'name email avatar');

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  sendSuccess(res, { message }, 'Message retrieved successfully', 200);
});

/**
 * @desc    Mark a message as read
 * @route   PATCH /api/messages/:id/read
 * @access  Private (Admin Only)
 */
export const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.status === 'unread') {
    message.status = 'read';
    await message.save();
  }

  sendSuccess(res, { message }, 'Message marked as read', 200);
});

/**
 * @desc    Reply to a message via email
 * @route   POST /api/messages/:id/reply
 * @access  Private (Admin Only)
 */
export const replyToMessage = catchAsync(async (req: Request, res: Response) => {
  const { adminReply } = req.body;
  const message = await Message.findById(req.params.id);

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  // Use the guest email directly since we saved it for both users and guests during creation
  const targetEmail = message.guestEmail;
  const targetName = message.guestName;

  if (!targetEmail) {
    throw new AppError('Cannot reply: no email address associated with this message.', 400);
  }

  // Send the reply email
  await sendContactReplyEmail(targetEmail, targetName, message.subject, adminReply, message.body);

  // Update message status
  message.adminReply = adminReply;
  message.status = 'replied';
  message.repliedAt = new Date();
  await message.save();

  sendSuccess(res, { message }, 'Reply sent successfully', 200);
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:id
 * @access  Private (Admin Only)
 */
export const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const message = await Message.findByIdAndDelete(req.params.id);

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  sendSuccess(res, null, 'Message deleted successfully', 200);
});
