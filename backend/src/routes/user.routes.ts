import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  getAllUsers,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  toggleBlockUser,
} from '../controllers/user.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import {
  updateProfileSchema,
  adminListUsersQuerySchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  userIdParamsSchema,
  blockUserSchema,
} from '../validators/user.validator';

const router = Router();

router.use(protect); // All user endpoints require authentication

router.get('/profile', getProfile);
router.patch('/profile', validate(updateProfileSchema), updateProfile);
router.put('/avatar', uploadImage.single('avatar'), updateAvatar);

// Admin-only routes
router.get('/', adminOnly, validate(adminListUsersQuerySchema), getAllUsers);
router.post('/', adminOnly, validate(adminCreateUserSchema), createUserByAdmin);
router.get('/:id', adminOnly, validate(userIdParamsSchema), getUserById);
router.patch('/:id', adminOnly, validate(adminUpdateUserSchema), updateUserByAdmin);
router.patch('/:id/block', adminOnly, validate(blockUserSchema), toggleBlockUser);
router.delete('/:id', adminOnly, validate(userIdParamsSchema), deleteUserByAdmin);

export default router;
