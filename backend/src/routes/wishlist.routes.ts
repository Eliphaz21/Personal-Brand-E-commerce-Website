import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { wishlistParamsSchema } from '../validators/wishlist.validator';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlist.controller';

const router = Router();

// All wishlist routes require authentication
router.use(protect);

router.get('/', getWishlist);
router.post('/:productId', validate(wishlistParamsSchema), addToWishlist);
router.delete('/:productId', validate(wishlistParamsSchema), removeFromWishlist);

export default router;
