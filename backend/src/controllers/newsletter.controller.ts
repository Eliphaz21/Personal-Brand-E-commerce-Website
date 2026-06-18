import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';
import NewsletterSubscriber from '../models/NewsletterSubscriber.model';
import NewsletterBroadcast from '../models/NewsletterBroadcast.model';
import Message from '../models/Message.model';
import {
  sendNewsletterWelcomeEmail,
  sendNewsletterBroadcastEmail,
  sendNewsletterMessageConfirmationEmail,
} from '../services/email.service';

/**
 * @desc    Subscribe to the wellness newsletter
 * @route   POST /api/newsletter/subscribe
 * @access  Public
 */
export const subscribeNewsletter = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  let subscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });

  if (subscriber) {
    if (subscriber.isActive) {
      sendSuccess(
        res,
        { subscriber, alreadySubscribed: true },
        'You are already subscribed. You can send a message to Coach Kidist below.',
        200
      );
      return;
    }

    subscriber.isActive = true;
    subscriber.name = name?.trim() || subscriber.name;
    subscriber.subscribedAt = new Date();
    await subscriber.save();
  } else {
    subscriber = await NewsletterSubscriber.create({
      email: normalizedEmail,
      name: name?.trim() || '',
      isActive: true,
    });
  }

  await sendNewsletterWelcomeEmail(normalizedEmail, subscriber.name || 'Friend');

  sendSuccess(
    res,
    { subscriber },
    'Welcome to the KidEnDu wellness digest! Check your email for confirmation.',
    201
  );
});

/**
 * @desc    Send a message to admin as a newsletter subscriber
 * @route   POST /api/newsletter/message
 * @access  Public (must be subscribed)
 */
export const sendNewsletterMessage = catchAsync(async (req: Request, res: Response) => {
  const { email, guestName, subject, body } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const subscriber = await NewsletterSubscriber.findOne({
    email: normalizedEmail,
    isActive: true,
  });

  if (!subscriber) {
    throw new AppError('Please subscribe to the newsletter before sending a message.', 400);
  }

  const displayName = guestName?.trim() || subscriber.name || normalizedEmail.split('@')[0];

  if (guestName?.trim() && !subscriber.name) {
    subscriber.name = guestName.trim();
    await subscriber.save();
  }

  const message = await Message.create({
    guestEmail: normalizedEmail,
    guestName: displayName,
    subject,
    body,
    messageType: 'newsletter',
    isDirectMessage: false,
    status: 'unread',
  });

  await sendNewsletterMessageConfirmationEmail(normalizedEmail, displayName, subject);

  sendSuccess(
    res,
    { message },
    'Your message was sent to Coach Kidist. You will receive replies at your email.',
    201
  );
});

/**
 * @desc    Get all newsletter subscribers
 * @route   GET /api/newsletter/subscribers
 * @access  Private/Admin
 */
export const getSubscribers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.active === 'true') filter.isActive = true;
  if (req.query.active === 'false') filter.isActive = false;

  const [subscribers, total, activeCount] = await Promise.all([
    NewsletterSubscriber.find(filter).sort({ subscribedAt: -1 }).skip(skip).limit(limit),
    NewsletterSubscriber.countDocuments(filter),
    NewsletterSubscriber.countDocuments({ isActive: true }),
  ]);

  sendSuccess(
    res,
    { subscribers, total, activeCount },
    'Subscribers fetched successfully',
    200,
    { page, totalPages: Math.ceil(total / limit), total }
  );
});

/**
 * @desc    Broadcast email to all active subscribers
 * @route   POST /api/newsletter/broadcast
 * @access  Private/Admin
 */
export const broadcastToSubscribers = catchAsync(async (req: Request, res: Response) => {
  const { subject, body } = req.body;
  const adminId = req.user?.userId;

  if (!adminId) {
    throw new AppError('Authentication required.', 401);
  }

  const subscribers = await NewsletterSubscriber.find({ isActive: true }).select('email name');

  if (subscribers.length === 0) {
    throw new AppError('No active subscribers to send to.', 400);
  }

  let sentCount = 0;
  const failures: string[] = [];

  for (const subscriber of subscribers) {
    try {
      await sendNewsletterBroadcastEmail(
        subscriber.email,
        subscriber.name || 'Friend',
        subject,
        body
      );
      sentCount += 1;
    } catch {
      failures.push(subscriber.email);
    }
  }

  if (sentCount === 0) {
    throw new AppError('Failed to send broadcast. Please check SMTP settings.', 500);
  }

  const broadcast = await NewsletterBroadcast.create({
    subject,
    body,
    sentBy: adminId,
    recipientCount: sentCount,
  });

  sendSuccess(
    res,
    {
      broadcast,
      sentCount,
      failedCount: failures.length,
      failures,
    },
    `Newsletter sent to ${sentCount} subscriber${sentCount !== 1 ? 's' : ''}.`,
    200
  );
});

/**
 * @desc    Get broadcast history
 * @route   GET /api/newsletter/broadcasts
 * @access  Private/Admin
 */
export const getBroadcastHistory = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 20;

  const broadcasts = await NewsletterBroadcast.find()
    .sort({ sentAt: -1 })
    .limit(limit)
    .populate('sentBy', 'name email');

  sendSuccess(res, { broadcasts }, 'Broadcast history fetched successfully', 200);
});

/**
 * @desc    Get newsletter inbox stats for admin dashboard
 * @route   GET /api/newsletter/stats
 * @access  Private/Admin
 */
export const getNewsletterStats = catchAsync(async (_req: Request, res: Response) => {
  const [activeSubscribers, unreadNewsletterMessages, totalNewsletterMessages] = await Promise.all([
    NewsletterSubscriber.countDocuments({ isActive: true }),
    Message.countDocuments({ messageType: 'newsletter', status: 'unread' }),
    Message.countDocuments({ messageType: 'newsletter' }),
  ]);

  sendSuccess(
    res,
    { activeSubscribers, unreadNewsletterMessages, totalNewsletterMessages },
    'Newsletter stats fetched successfully',
    200
  );
});
