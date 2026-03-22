import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export async function uploadFileController(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        message: 'No file uploaded',
        error: 'A file is required',
      });
      return;
    }

    res.status(200).json({
      filePath: req.file.path,
      fileType: req.file.mimetype,
    });
  } catch (error: unknown) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          message: 'File too large',
          error: 'File size must not exceed 10MB',
        });
        return;
      }
    }
    res.status(500).json({
      message: 'Error uploading file',
      error: 'Internal server error',
    });
  }
}
