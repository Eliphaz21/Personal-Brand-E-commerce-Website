import { Router } from 'express';
import {
  createMessage,
  getMessages,
  getMessageById,
  markAsRead,
  replyToMessage,
  deleteMessage,
} from '../controllers/message.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createMessageSchema, replyMessageSchema } from '../validators/message.validator';

const router = Router();

// Public route to submit a contact message
// We conditionally apply 'protect' if we wanted to enforce it, but we want it open.
// Since we want to capture req.user IF a token is provided, we can use an optional auth middleware.
// But our current 'protect' middleware throws an error if token is missing.
// A simple workaround for this specific route is to check headers manually in the controller,
// or create an 'optionalProtect' middleware. For now, the controller doesn't strictly need req.user
// if guestEmail and guestName are provided, but to link it to a user, it's helpful.
// Let's create a quick inline middleware for optional auth just for this route.
import { verifyAccessToken } from '../utils/generateToken';

const optionalAuth = (req: any, _res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = verifyAccessToken(token);
    } catch (err) {
      // Ignore token errors, treat as guest
    }
  }
  next();
};

router.post('/', optionalAuth, validate(createMessageSchema), createMessage);

// Admin-only routes below
router.use(protect);
router.use(adminOnly);

router.get('/', getMessages);
router.get('/:id', getMessageById);
router.patch('/:id/read', markAsRead);
router.post('/:id/reply', validate(replyMessageSchema), replyToMessage);
router.delete('/:id', deleteMessage);

export default router;
