import { Router } from 'express';
import {
  subscribeNewsletter,
  sendNewsletterMessage,
  getSubscribers,
  broadcastToSubscribers,
  getBroadcastHistory,
  getNewsletterStats,
} from '../controllers/newsletter.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { contactLimiter } from '../middlewares/rateLimiter.middleware';
import {
  subscribeNewsletterSchema,
  newsletterMessageSchema,
  broadcastNewsletterSchema,
} from '../validators/newsletter.validator';

const router = Router();

router.post('/subscribe', contactLimiter, validate(subscribeNewsletterSchema), subscribeNewsletter);
router.post('/message', contactLimiter, validate(newsletterMessageSchema), sendNewsletterMessage);

router.use(protect);
router.use(adminOnly);

router.get('/stats', getNewsletterStats);
router.get('/subscribers', getSubscribers);
router.get('/broadcasts', getBroadcastHistory);
router.post('/broadcast', validate(broadcastNewsletterSchema), broadcastToSubscribers);

export default router;
