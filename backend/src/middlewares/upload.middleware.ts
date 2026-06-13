import multer from 'multer';
import { AppError } from '../utils/AppError';

// Use memory storage — buffer is uploaded to Cloudinary directly
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.', 400));
  }
};

/** Image upload — max 5MB per file */
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10, // max 10 files per upload
  },
});

// Document upload for AI knowledge base (PDF, DOCX, TXT)
const docFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedDocTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  if (allowedDocTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid document type. Only PDF, DOCX, and TXT files are allowed.', 400));
  }
};

/** Document upload for AI RAG — max 50MB */
export const uploadDocument = multer({
  storage,
  fileFilter: docFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 5,
  },
});
