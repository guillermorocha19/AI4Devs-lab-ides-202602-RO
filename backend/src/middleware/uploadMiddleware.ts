import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46]);
const DOCX_MAGIC_BYTES = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export function validateMagicBytes(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.file) {
    next();
    return;
  }

  const filePath = req.file.path;

  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(4);
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    const isPdf = buffer.compare(PDF_MAGIC_BYTES, 0, 4, 0, 4) === 0;
    const isDocx = buffer.compare(DOCX_MAGIC_BYTES, 0, 4, 0, 4) === 0;

    if (!isPdf && !isDocx) {
      fs.unlinkSync(filePath);
      res.status(400).json({
        message: 'Invalid file type',
        error: 'File content does not match its declared type',
      });
      return;
    }

    next();
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({
      message: 'Error validating file',
      error: 'Internal server error',
    });
  }
}
