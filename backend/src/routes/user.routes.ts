import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  getAllUsers,
  toggleBlockUser,
} from '../controllers/user.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import { updateProfileSchema } from '../validators/user.validator';

const router = Router();

router.use(protect); // All user endpoints require authentication

router.get('/profile', getProfile);
router.patch('/profile', validate(updateProfileSchema), updateProfile);
router.put('/avatar', uploadImage.single('avatar'), updateAvatar);

// Admin-only routes
router.get('/', adminOnly, getAllUsers);
router.patch('/:id/block', adminOnly, toggleBlockUser);

export default router;
