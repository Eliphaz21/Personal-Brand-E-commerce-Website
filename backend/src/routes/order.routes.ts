import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } from '../controllers/order.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';

const router = Router();

router.use(protect); // All order routes require authentication

router.post('/', validate(createOrderSchema), createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);

// Admin routes
router.use(adminOnly);
router.get('/', getAllOrders);
router.put('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
