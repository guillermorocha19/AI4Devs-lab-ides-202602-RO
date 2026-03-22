import { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import candidateRoutes from './routes/candidateRoutes';
import uploadRoutes from './routes/uploadRoutes';
import {
  helmetMiddleware,
  apiLimiter,
  uploadLimiter,
  sanitizeInputMiddleware,
} from './middleware/securityMiddleware';

dotenv.config();

export const app = express();
const port = 3010;

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(helmetMiddleware);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeInputMiddleware);

app.get('/', (_req, res) => {
  res.send('Hola LTI!');
});

app.use('/candidates', apiLimiter, candidateRoutes);
app.use('/upload', uploadLimiter, uploadRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const errorMessage = isProduction ? 'Internal server error' : err.message;
  res.status(500).json({ message: 'Internal server error', error: errorMessage });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
