import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  addToCartSchema,
  updateCartItemQtySchema,
  removeFromCartSchema,
} from '../validators/cart.validator';
import {
  getCart,
  addToCart,
  updateCartItemQty,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller';

const router = Router();

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/items', validate(addToCartSchema), addToCart);
router.put('/items/:productId', validate(updateCartItemQtySchema), updateCartItemQty);
router.delete('/items/:productId', validate(removeFromCartSchema), removeFromCart);
router.delete('/', clearCart);

export default router;
