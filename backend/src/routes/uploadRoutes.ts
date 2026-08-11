import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

// Memory storage for multer (streams directly to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

router.post(
  '/',
  requireAuth,
  requireRole('Super Admin', 'Content Admin'),
  upload.single('image'),
  uploadImage
);

export default router;
