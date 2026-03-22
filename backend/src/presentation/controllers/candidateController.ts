import { Request, Response, NextFunction } from 'express';
import { addCandidate } from '../../application/services/candidateService';
import { Logger } from '../../infrastructure/logger';

const logger = new Logger();

export async function addCandidateController(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ message: 'Validation error', error: 'No data provided' });
      return;
    }

    const candidate = await addCandidate(req.body);
    res.status(201).json(candidate);
  } catch (error: unknown) {
    if (error instanceof Error) {
      const msg = error.message;
      const isClientError =
        msg.includes('Validation') ||
        msg.includes('could not be registered') ||
        msg.includes('required');

      if (isClientError) {
        logger.warn('Candidate validation failed', { error: msg });
        res.status(400).json({ message: 'Validation error', error: msg });
      } else {
        logger.error('Error creating candidate', { error: msg });
        res.status(500).json({ message: 'Error creating candidate', error: msg });
      }
    } else {
      logger.error('Unexpected error creating candidate', { error: String(error) });
      res.status(500).json({
        message: 'Error creating candidate',
        error: 'Internal server error',
      });
    }
  }
}
