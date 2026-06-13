import { Router } from 'express';
import { createPaymentIntent } from '../controllers/payment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.post('/create-intent', createPaymentIntent);

// Note: the Stripe webhook route is defined directly in app.ts because it requires raw body parsing.

export default router;
