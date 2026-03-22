import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { upload, validateMagicBytes } from '../middleware/uploadMiddleware';
import { uploadFileController } from '../presentation/controllers/uploadController';

const router = Router();

router.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            message: 'File too large',
            error: 'File size must not exceed 10MB',
          });
          return;
        }
        res.status(400).json({
          message: 'Upload error',
          error: err.message,
        });
        return;
      }
      if (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        res.status(400).json({
          message: 'Invalid file type',
          error: errorMessage,
        });
        return;
      }
      next();
    });
  },
  validateMagicBytes,
  uploadFileController,
);

export default router;
