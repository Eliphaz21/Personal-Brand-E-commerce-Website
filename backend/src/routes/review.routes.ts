import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  voteHelpful,
} from '../controllers/review.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createReviewSchema, updateReviewSchema } from '../validators/review.validator';

const router = Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Private routes
router.use(protect);

router.post('/', validate(createReviewSchema), createReview);
router.put('/:id', validate(updateReviewSchema), updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/helpful', voteHelpful);

export default router;
